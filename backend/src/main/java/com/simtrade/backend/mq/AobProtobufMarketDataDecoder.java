package com.simtrade.backend.mq;

import com.google.protobuf.CodedInputStream;
import com.google.protobuf.WireFormat;
import com.simtrade.backend.dto.MarketData;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class AobProtobufMarketDataDecoder {

    private static final int FIELD_TIMESTAMP = 1;
    private static final int FIELD_ASSET_ID = 2;
    private static final int FIELD_PRICE = 7;
    private static final int FIELD_PREV_CLOSE = 8;
    private static final int FIELD_ORDER_BOOK = 100;

    public Optional<MarketData> decode(byte[] payload) {
        if (payload == null || payload.length == 0) {
            return Optional.empty();
        }

        Optional<MarketData> direct = decodeQuotePayload(payload);
        if (direct.isPresent()) {
            return direct;
        }

        List<byte[]> nestedCandidates = extractNestedCandidates(payload);
        for (byte[] nested : nestedCandidates) {
            Optional<MarketData> decoded = decodeQuotePayload(nested);
            if (decoded.isPresent()) {
                return decoded;
            }
        }
        return Optional.empty();
    }

    private Optional<MarketData> decodeQuotePayload(byte[] payload) {
        try {
            CodedInputStream input = CodedInputStream.newInstance(payload);
            MarketData marketData = new MarketData();
            BigDecimal price = null;
            List<MarketData.Level> asks = Collections.emptyList();
            List<MarketData.Level> bids = Collections.emptyList();

            while (!input.isAtEnd()) {
                int tag = input.readTag();
                if (tag == 0) {
                    break;
                }
                int field = WireFormat.getTagFieldNumber(tag);
                int wireType = WireFormat.getTagWireType(tag);
                if (field == FIELD_TIMESTAMP && wireType == WireFormat.WIRETYPE_VARINT) {
                    marketData.setTimestamp(input.readUInt64());
                    continue;
                }
                if (field == FIELD_ASSET_ID && wireType == WireFormat.WIRETYPE_LENGTH_DELIMITED) {
                    marketData.setStockCode(normalizeStockCode(input.readStringRequireUtf8()));
                    continue;
                }
                if (field == FIELD_PRICE) {
                    price = readDecimalByWireType(input, wireType, price);
                    continue;
                }
                if (field == FIELD_PREV_CLOSE) {
                    // Field parsed for compatibility, but currently not mapped into MarketData DTO.
                    readDecimalByWireType(input, wireType, null);
                    continue;
                }
                if (field == FIELD_ORDER_BOOK && wireType == WireFormat.WIRETYPE_LENGTH_DELIMITED) {
                    byte[] orderBookBytes = input.readByteArray();
                    OrderBookPair pair = parseOrderBook(orderBookBytes, price);
                    asks = pair.asks;
                    bids = pair.bids;
                    continue;
                }
                input.skipField(tag);
            }

            if (marketData.getStockCode() == null || marketData.getStockCode().trim().isEmpty()) {
                return Optional.empty();
            }
            if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
                return Optional.empty();
            }
            marketData.setNominalPrice(price);
            marketData.setLastPrice(price);
            marketData.setAsks(asks);
            marketData.setBids(bids);
            return Optional.of(marketData);
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private List<byte[]> extractNestedCandidates(byte[] payload) {
        List<byte[]> nested = new ArrayList<byte[]>();
        try {
            CodedInputStream input = CodedInputStream.newInstance(payload);
            while (!input.isAtEnd()) {
                int tag = input.readTag();
                if (tag == 0) {
                    break;
                }
                int field = WireFormat.getTagFieldNumber(tag);
                int wireType = WireFormat.getTagWireType(tag);
                if (wireType == WireFormat.WIRETYPE_LENGTH_DELIMITED) {
                    byte[] value = input.readByteArray();
                    // BasePub.contents=2, PushMsgInfo.contents=4
                    if ((field == 2 || field == 4) && value.length > 8) {
                        nested.add(value);
                    }
                    continue;
                }
                input.skipField(tag);
            }
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
        return nested;
    }

    private OrderBookPair parseOrderBook(byte[] bytes, BigDecimal latestPrice) throws IOException {
        Map<Integer, List<MarketData.Level>> levelsByField = new LinkedHashMap<Integer, List<MarketData.Level>>();
        collectLevels(bytes, 0, levelsByField);
        List<MarketData.Level> field1 = levelsByField.getOrDefault(1, Collections.emptyList());
        List<MarketData.Level> field2 = levelsByField.getOrDefault(2, Collections.emptyList());
        if (field1.isEmpty() && field2.isEmpty()) {
            return new OrderBookPair(Collections.<MarketData.Level>emptyList(), Collections.<MarketData.Level>emptyList());
        }

        // Heuristic:
        // - If both sides have values, lower side tends to bids and higher side tends to asks.
        // - If only one side exists, keep original assignment by field number.
        if (!field1.isEmpty() && !field2.isEmpty()) {
            BigDecimal p1 = field1.get(0).getPrice();
            BigDecimal p2 = field2.get(0).getPrice();
            if (p1 != null && p2 != null) {
                if (p1.compareTo(p2) > 0) {
                    return new OrderBookPair(field1, field2);
                }
                if (p1.compareTo(p2) < 0) {
                    return new OrderBookPair(field2, field1);
                }
            }
            if (latestPrice != null) {
                BigDecimal diff1 = p1 == null ? null : p1.subtract(latestPrice).abs();
                BigDecimal diff2 = p2 == null ? null : p2.subtract(latestPrice).abs();
                if (diff1 != null && diff2 != null && diff1.compareTo(diff2) > 0) {
                    return new OrderBookPair(field1, field2);
                }
            }
            return new OrderBookPair(field1, field2);
        }

        if (!field1.isEmpty()) {
            return new OrderBookPair(field1, Collections.<MarketData.Level>emptyList());
        }
        return new OrderBookPair(Collections.<MarketData.Level>emptyList(), field2);
    }

    private void collectLevels(byte[] messageBytes, int depth, Map<Integer, List<MarketData.Level>> levelsByField) throws IOException {
        if (messageBytes == null || messageBytes.length == 0 || depth > 4) {
            return;
        }
        CodedInputStream input = CodedInputStream.newInstance(messageBytes);
        while (!input.isAtEnd()) {
            int tag = input.readTag();
            if (tag == 0) {
                break;
            }
            int field = WireFormat.getTagFieldNumber(tag);
            int wireType = WireFormat.getTagWireType(tag);
            if (wireType == WireFormat.WIRETYPE_LENGTH_DELIMITED) {
                byte[] child = input.readByteArray();
                Optional<MarketData.Level> parsedLevel = parseLevel(child);
                if (parsedLevel.isPresent()) {
                    levelsByField.computeIfAbsent(field, key -> new ArrayList<MarketData.Level>()).add(parsedLevel.get());
                } else {
                    collectLevels(child, depth + 1, levelsByField);
                }
                continue;
            }
            input.skipField(tag);
        }
    }

    private Optional<MarketData.Level> parseLevel(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return Optional.empty();
        }
        try {
            CodedInputStream input = CodedInputStream.newInstance(bytes);
            BigDecimal price = null;
            Integer volume = null;
            while (!input.isAtEnd()) {
                int tag = input.readTag();
                if (tag == 0) {
                    break;
                }
                int wireType = WireFormat.getTagWireType(tag);
                if (wireType == WireFormat.WIRETYPE_VARINT) {
                    long value = input.readUInt64();
                    if (volume == null && value >= 0 && value <= Integer.MAX_VALUE) {
                        volume = (int) value;
                    }
                    continue;
                }
                if (wireType == WireFormat.WIRETYPE_FIXED32) {
                    float value = Float.intBitsToFloat(input.readFixed32());
                    if (price == null && Float.isFinite(value) && value > 0f) {
                        price = new BigDecimal(Float.toString(value));
                    }
                    continue;
                }
                if (wireType == WireFormat.WIRETYPE_FIXED64) {
                    double value = Double.longBitsToDouble(input.readFixed64());
                    if (price == null && Double.isFinite(value) && value > 0d) {
                        price = BigDecimal.valueOf(value);
                    } else if (volume == null && value >= 0d && value <= Integer.MAX_VALUE) {
                        volume = (int) Math.round(value);
                    }
                    continue;
                }
                if (wireType == WireFormat.WIRETYPE_LENGTH_DELIMITED) {
                    // Nested object, likely not a leaf level item.
                    input.readByteArray();
                    return Optional.empty();
                }
                input.skipField(tag);
            }

            if (price == null || volume == null) {
                return Optional.empty();
            }
            MarketData.Level level = new MarketData.Level();
            level.setPrice(price);
            level.setVolume(Math.max(0, volume));
            return Optional.of(level);
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private BigDecimal readDecimalByWireType(CodedInputStream input, int wireType, BigDecimal fallback) throws IOException {
        if (wireType == WireFormat.WIRETYPE_FIXED32) {
            float value = Float.intBitsToFloat(input.readFixed32());
            if (Float.isFinite(value) && value > 0f) {
                return new BigDecimal(Float.toString(value));
            }
            return fallback;
        }
        if (wireType == WireFormat.WIRETYPE_FIXED64) {
            double value = Double.longBitsToDouble(input.readFixed64());
            if (Double.isFinite(value) && value > 0d) {
                return BigDecimal.valueOf(value);
            }
            return fallback;
        }
        if (wireType == WireFormat.WIRETYPE_VARINT) {
            long value = input.readUInt64();
            if (value > 0L) {
                return BigDecimal.valueOf(value);
            }
            return fallback;
        }
        if (wireType == WireFormat.WIRETYPE_LENGTH_DELIMITED) {
            input.readByteArray();
        } else {
            // Unknown or unsupported wire type for price-like field.
            return fallback;
        }
        return fallback;
    }

    private String normalizeStockCode(String raw) {
        if (raw == null) {
            return null;
        }
        String code = raw.trim().toUpperCase();
        if (code.endsWith(".HK")) {
            code = code.substring(0, code.length() - 3);
        }
        if (code.matches("\\d{4}")) {
            return "0" + code;
        }
        return code;
    }

    private static class OrderBookPair {
        private final List<MarketData.Level> asks;
        private final List<MarketData.Level> bids;

        private OrderBookPair(List<MarketData.Level> asks, List<MarketData.Level> bids) {
            this.asks = asks;
            this.bids = bids;
        }
    }
}
