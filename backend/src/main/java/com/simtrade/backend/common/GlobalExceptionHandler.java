package com.simtrade.backend.common;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException ex) {
        String language = resolveLanguage();
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .map(item -> ErrorMessageLocalizer.localize(item, language))
                .collect(Collectors.joining(", "));
        return Result.error(400, msg);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Result<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        String language = resolveLanguage();
        return Result.error(400, ErrorMessageLocalizer.localize(ex.getMessage(), language));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public Result<?> handleMissingRequestHeaderException(MissingRequestHeaderException ex) {
        String language = resolveLanguage();
        String message = "X-User-Id".equalsIgnoreCase(ex.getHeaderName())
                ? "User ID cannot be blank."
                : ex.getMessage();
        return Result.error(400, ErrorMessageLocalizer.localize(message, language));
    }

    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception ex) {
        String language = resolveLanguage();
        String fallback = LanguageSupport.text(
                language,
                "系統繁忙，請稍後再試。",
                "系统繁忙，请稍后再试。",
                "System is busy. Please try again later."
        );
        String msg = ex.getMessage() == null ? fallback : ErrorMessageLocalizer.localize(ex.getMessage(), language);
        return Result.error(500, msg);
    }

    private String resolveLanguage() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return LanguageSupport.DEFAULT_LANG;
        }
        HttpServletRequest request = attributes.getRequest();
        if (request == null) {
            return LanguageSupport.DEFAULT_LANG;
        }
        return LanguageSupport.determineLanguage(
                request.getHeader("X-Lang"),
                request.getParameter("lang"),
                request.getHeader("Accept-Language")
        );
    }
}
