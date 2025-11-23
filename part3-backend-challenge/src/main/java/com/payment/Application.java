package com.payment;

import io.micronaut.runtime.Micronaut;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;

import java.util.TimeZone;

@OpenAPIDefinition(
    info = @Info(
        title = "Payment Platform API",
        version = "1.0",
        description = "API for managing merchant transactions and payments",
        contact = @Contact(name = "Payment Team", email = "api@payment.com")
    )
)
public class Application {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kathmandu"));
        Micronaut.run(Application.class, args);
    }
}
