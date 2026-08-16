package com.collegebus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BookingCutoffException extends RuntimeException {
    public BookingCutoffException(String message) {
        super(message);
    }
}
