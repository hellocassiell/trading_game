package com.simtrade.backend.mq;

import com.google.protobuf.CodedOutputStream;
import com.simtrade.backend.dto.MarketData;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.Optional;

class AobProtobufMarketDataDecoderTest {

    private final AobProtobufMarketDataDecoder decoder = new AobProtobufMarketDataDecoder();

    @Test
    void decode_shouldParseDirectDetailPayload() throws Exception {
        byte[] quotePayload = buildQuotePayload("00700.HK", 301.20f, 300.10f, 301.30f, 3100, 301.10f, 4200);

        Optional<MarketData> decoded = decoder.decode(quotePayload);

        Assertions.assertTrue(decoded.isPresent());
        MarketData marketData = decoded.get();
        Assertions.assertEquals("00700", marketData.getStockCode());
        Assertions.assertEquals(new BigDecimal("301.2"), marketData.getNominalPrice().stripTrailingZeros());
        Assertions.assertFalse(marketData.getAsks().isEmpty());
        Assertions.assertFalse(marketData.getBids().isEmpty());
    }

    @Test
    void decode_shouldParseBasePubWrappedPayload() throws Exception {
        byte[] quotePayload = buildQuotePayload("02800.HK", 22.35f, 22.10f, 22.36f, 120000, 22.34f, 95000);
        byte[] wrapped = buildBasePub(1, quotePayload, 1, "200");

        Optional<MarketData> decoded = decoder.decode(wrapped);

        Assertions.assertTrue(decoded.isPresent());
        Assertions.assertEquals("02800", decoded.get().getStockCode());
        Assertions.assertEquals(new BigDecimal("22.35"), decoded.get().getNominalPrice());
    }

    private byte[] buildBasePub(int command, byte[] contents, int marketType, String code) throws Exception {
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        CodedOutputStream coded = CodedOutputStream.newInstance(stream);
        coded.writeEnum(1, command);
        coded.writeByteArray(2, contents);
        coded.writeEnum(3, marketType);
        coded.writeString(4, code);
        coded.flush();
        return stream.toByteArray();
    }

    private byte[] buildQuotePayload(
            String assetId,
            float price,
            float prevClose,
            float askPrice,
            int askVolume,
            float bidPrice,
            int bidVolume) throws Exception {
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        CodedOutputStream coded = CodedOutputStream.newInstance(stream);
        coded.writeUInt64(1, System.currentTimeMillis());
        coded.writeString(2, assetId);
        coded.writeFloat(7, price);
        coded.writeFloat(8, prevClose);
        coded.writeByteArray(100, buildOrderBook(askPrice, askVolume, bidPrice, bidVolume));
        coded.flush();
        return stream.toByteArray();
    }

    private byte[] buildOrderBook(float askPrice, int askVolume, float bidPrice, int bidVolume) throws Exception {
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        CodedOutputStream coded = CodedOutputStream.newInstance(stream);
        // field 1 as asks, field 2 as bids
        coded.writeByteArray(1, buildOrderBookLevel(askPrice, askVolume));
        coded.writeByteArray(2, buildOrderBookLevel(bidPrice, bidVolume));
        coded.flush();
        return stream.toByteArray();
    }

    private byte[] buildOrderBookLevel(float price, int volume) throws Exception {
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        CodedOutputStream coded = CodedOutputStream.newInstance(stream);
        coded.writeFloat(1, price);
        coded.writeUInt64(2, volume);
        coded.flush();
        return stream.toByteArray();
    }
}

