package com.simtrade.backend.common;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ErrorMessageLocalizer {

    private static final Pattern LOT_SIZE_PATTERN = Pattern.compile("Quantity must be a multiple of lot size: (\\d+)");
    private static final Pattern HOLDINGS_PATTERN = Pattern.compile("Insufficient holdings to sell\\. Available: (\\d+)");
    private static final Pattern TICKS_PATTERN = Pattern.compile("Price exceeds ±20 ticks limit\\. Allowed range: \\[(.+), (.+)]");
    private static final Pattern AUTH_RATE_LIMIT_EN_PATTERN = Pattern.compile("Too many requests\\. Please try again later \\((\\d+)s\\)\\.");
    private static final Pattern AUTH_RATE_LIMIT_ZH_PATTERN = Pattern.compile("发送过于频繁，请稍后再试（(\\d+)s）");

    private static final Map<String, Triple> EXACT = new LinkedHashMap<String, Triple>();

    static {
        EXACT.put("Request cannot be null.", triple("請求資料不能為空。", "请求资料不能为空。", "Request payload cannot be null."));
        EXACT.put("User ID cannot be blank.", triple("用戶 ID 不能為空。", "用户 ID 不能为空。", "User ID cannot be blank."));
        EXACT.put("Stock code cannot be blank.", triple("股票代號不能為空。", "股票代码不能为空。", "Stock code cannot be blank."));
        EXACT.put("Direction cannot be blank", triple("買賣方向不能為空。", "买卖方向不能为空。", "Direction cannot be blank."));
        EXACT.put("Direction must be BUY or SELL", triple("買賣方向必須為 BUY 或 SELL。", "买卖方向必须为 BUY 或 SELL。", "Direction must be BUY or SELL."));
        EXACT.put("Order type cannot be blank", triple("訂單類型不能為空。", "订单类型不能为空。", "Order type cannot be blank."));
        EXACT.put("Order type must be LIMIT or MARKET", triple("訂單類型必須為 LIMIT 或 MARKET。", "订单类型必须为 LIMIT 或 MARKET。", "Order type must be LIMIT or MARKET."));
        EXACT.put("Price is required for LIMIT order.", triple("限價單必須輸入價格。", "限价单必须输入价格。", "Price is required for LIMIT orders."));
        EXACT.put("Price cannot be null.", triple("價格不能為空。", "价格不能为空。", "Price cannot be null."));
        EXACT.put("Price must be greater than 0", triple("價格必須大於 0。", "价格必须大于 0。", "Price must be greater than 0."));
        EXACT.put("Quantity cannot be null", triple("股數不能為空。", "股数不能为空。", "Quantity cannot be null."));
        EXACT.put("Quantity cannot be null.", triple("股數不能為空。", "股数不能为空。", "Quantity cannot be null."));
        EXACT.put("Quantity must be greater than 0", triple("股數必須大於 0。", "股数必须大于 0。", "Quantity must be greater than 0."));
        EXACT.put("Quantity must be greater than 0.", triple("股數必須大於 0。", "股数必须大于 0。", "Quantity must be greater than 0."));
        EXACT.put("Stock is not tradable in the whitelist pool.", triple("該股票不在可交易白名單內。", "该股票不在可交易白名单内。", "Stock is not tradable in the whitelist pool."));
        EXACT.put("Stock is suspended. Only cancellation is allowed.", triple("該股票目前停牌，只允許取消掛單。", "该股票目前停牌，只允许取消挂单。", "Stock is suspended. Only cancellation is allowed."));
        EXACT.put("Buy price cannot be lower than HK$0.05.", triple("買入價不能低於 HK$0.05。", "买入价不能低于 HK$0.05。", "Buy price cannot be lower than HK$0.05."));
        EXACT.put("Sell price cannot be lower than HK$0.01.", triple("賣出價不能低於 HK$0.01。", "卖出价不能低于 HK$0.01。", "Sell price cannot be lower than HK$0.01."));
        EXACT.put("Exceeded maximum of 20 buy orders per day.", triple("已超過每日最多 20 筆買入委託限制。", "已超过每日最多 20 笔买入委托限制。", "Exceeded maximum of 20 buy orders per day."));
        EXACT.put("Exceeded maximum of 5 pending LIMIT orders.", triple("已超過最多 5 筆限價掛單輪候限制。", "已超过最多 5 笔限价挂单轮候限制。", "Exceeded maximum of 5 pending LIMIT orders."));
        EXACT.put("Market orders are only accepted during trading hours (09:30-12:00, 13:00-16:00 HKT). Please use LIMIT order outside trading hours.", triple("市價單僅可於交易時段提交（09:30-12:00、13:00-16:00 HKT），非交易時段請使用限價單。", "市价单仅可于交易时段提交（09:30-12:00、13:00-16:00 HKT），非交易时段请使用限价单。", "Market orders are only accepted during trading hours (09:30-12:00, 13:00-16:00 HKT). Please use LIMIT orders outside trading hours."));
        EXACT.put("Order not found", triple("找不到訂單。", "找不到订单。", "Order not found."));
        EXACT.put("Order is not cancelable", triple("訂單當前狀態不可取消。", "订单当前状态不可取消。", "Order is not cancelable."));
        EXACT.put("Order is not amendable", triple("訂單當前狀態不可改單。", "订单当前状态不可改单。", "Order is not amendable."));
        EXACT.put("Only LIMIT order can be amended", triple("僅限價單可改單。", "仅限价单可改单。", "Only LIMIT orders can be amended."));
        EXACT.put("Duplicate order submission detected. Please try again later.", triple("檢測到重複下單，請稍後再試。", "检测到重复下单，请稍后再试。", "Duplicate order submission detected. Please try again later."));
        EXACT.put("重复的交易请求，请稍后再试。", triple("檢測到重複下單，請稍後再試。", "检测到重复下单，请稍后再试。", "Duplicate order submission detected. Please try again later."));

        EXACT.put("手机号不能为空", triple("手機號不能為空。", "手机号不能为空。", "Phone number is required."));
        EXACT.put("请输入 8 位香港手机号", triple("請輸入 8 位香港手機號。", "请输入 8 位香港手机号。", "Please enter an 8-digit HK phone number."));
        EXACT.put("验证码不能为空", triple("驗證碼不能為空。", "验证码不能为空。", "Verification code is required."));
        EXACT.put("请输入 6 位验证码", triple("請輸入 6 位驗證碼。", "请输入 6 位验证码。", "Please enter a 6-digit verification code."));
        EXACT.put("昵称不能为空", triple("暱稱不能為空。", "昵称不能为空。", "Nickname is required."));
        EXACT.put("昵称长度不能超过 20", triple("暱稱長度不能超過 20。", "昵称长度不能超过 20。", "Nickname length cannot exceed 20."));
        EXACT.put("头像不能为空", triple("頭像不能為空。", "头像不能为空。", "Avatar is required."));
        EXACT.put("头像标识长度不能超过 128", triple("頭像標識長度不能超過 128。", "头像标识长度不能超过 128。", "Avatar identifier length cannot exceed 128."));
        EXACT.put("验证码已失效，请重新获取", triple("驗證碼已失效，請重新獲取。", "验证码已失效，请重新获取。", "Verification code expired. Please request a new one."));
        EXACT.put("验证码不正确", triple("驗證碼不正確。", "验证码不正确。", "Invalid verification code."));
        EXACT.put("Avatar is required.", triple("頭像不能為空。", "头像不能为空。", "Avatar is required."));
        EXACT.put("Unsupported avatar identifier.", triple("頭像標識不受支持，請重新選擇。", "头像标识不受支持，请重新选择。", "Unsupported avatar identifier."));
        EXACT.put("Avatar file is required.", triple("請先選擇要上傳的頭像文件。", "请先选择要上传的头像文件。", "Please select an avatar file to upload."));
        EXACT.put("Unsupported avatar format. Please upload PNG/JPG/WEBP/GIF.", triple("頭像格式不支持，請上傳 PNG/JPG/WEBP/GIF。", "头像格式不支持，请上传 PNG/JPG/WEBP/GIF。", "Unsupported avatar format. Please upload PNG/JPG/WEBP/GIF."));
        EXACT.put("Avatar file size must be <= 2MB.", triple("頭像大小不可超過 2MB。", "头像大小不可超过 2MB。", "Avatar file size must be <= 2MB."));
        EXACT.put("Avatar file not found.", triple("頭像文件不存在。", "头像文件不存在。", "Avatar file not found."));
        EXACT.put("Failed to store avatar file.", triple("頭像保存失敗，請稍後再試。", "头像保存失败，请稍后再试。", "Failed to store avatar file."));
        EXACT.put("Invalid avatar filename.", triple("頭像文件名不合法。", "头像文件名不合法。", "Invalid avatar filename."));
        EXACT.put("Invalid avatar file path.", triple("頭像文件路徑不合法。", "头像文件路径不合法。", "Invalid avatar file path."));
        EXACT.put("Failed to initialize avatar upload directory.", triple("頭像目錄初始化失敗。", "头像目录初始化失败。", "Failed to initialize avatar upload directory."));
    }

    private ErrorMessageLocalizer() {}

    public static String localize(String message, String language) {
        if (message == null || message.trim().isEmpty()) {
            return LanguageSupport.text(language, "請稍後再試。", "请稍后再试。", "Please try again later.");
        }

        String trimmed = message.trim();
        Triple exact = EXACT.get(trimmed);
        if (exact != null) {
            return exact.pick(language);
        }

        Matcher lotSizeMatcher = LOT_SIZE_PATTERN.matcher(trimmed);
        if (lotSizeMatcher.matches()) {
            String lotSize = lotSizeMatcher.group(1);
            return LanguageSupport.text(
                    language,
                    "交易股數必須為每手 " + lotSize + " 股的整數倍。",
                    "交易股数必须为每手 " + lotSize + " 股的整数倍。",
                    "Quantity must be a multiple of lot size " + lotSize + "."
            );
        }

        Matcher holdingsMatcher = HOLDINGS_PATTERN.matcher(trimmed);
        if (holdingsMatcher.matches()) {
            String available = holdingsMatcher.group(1);
            return LanguageSupport.text(
                    language,
                    "可賣出持倉不足，可用數量：" + available + "。",
                    "可卖出持仓不足，可用数量：" + available + "。",
                    "Insufficient holdings to sell. Available: " + available + "."
            );
        }

        Matcher ticksMatcher = TICKS_PATTERN.matcher(trimmed);
        if (ticksMatcher.matches()) {
            String min = ticksMatcher.group(1);
            String max = ticksMatcher.group(2);
            return LanguageSupport.text(
                    language,
                    "價格超出 ±20 個價位限制，允許範圍：[" + min + ", " + max + "]。",
                    "价格超出 ±20 个价位限制，允许范围：[" + min + ", " + max + "]。",
                    "Price exceeds the ±20 ticks limit. Allowed range: [" + min + ", " + max + "]."
            );
        }

        Matcher rateLimitEn = AUTH_RATE_LIMIT_EN_PATTERN.matcher(trimmed);
        if (rateLimitEn.matches()) {
            String seconds = rateLimitEn.group(1);
            return LanguageSupport.text(
                    language,
                    "發送過於頻繁，請稍後再試（" + seconds + "s）。",
                    "发送过于频繁，请稍后再试（" + seconds + "s）。",
                    "Too many requests. Please try again later (" + seconds + "s)."
            );
        }

        Matcher rateLimitZh = AUTH_RATE_LIMIT_ZH_PATTERN.matcher(trimmed);
        if (rateLimitZh.matches()) {
            String seconds = rateLimitZh.group(1);
            return LanguageSupport.text(
                    language,
                    "發送過於頻繁，請稍後再試（" + seconds + "s）。",
                    "发送过于频繁，请稍后再试（" + seconds + "s）。",
                    "Too many requests. Please try again later (" + seconds + "s)."
            );
        }

        return trimmed;
    }

    private static Triple triple(String zhHant, String zhHans, String en) {
        return new Triple(zhHant, zhHans, en);
    }

    private static final class Triple {
        private final String zhHant;
        private final String zhHans;
        private final String en;

        private Triple(String zhHant, String zhHans, String en) {
            this.zhHant = zhHant;
            this.zhHans = zhHans;
            this.en = en;
        }

        private String pick(String language) {
            return LanguageSupport.text(language, zhHant, zhHans, en);
        }
    }
}
