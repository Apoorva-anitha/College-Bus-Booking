package com.collegebus.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI collegeBusOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart College Bus Management & Multi-Corridor Route Optimizer API")
                        .description("Production Spring Boot 3 REST API for demand clustering, graph route optimization, pessimistic concurrency booking, and fleet management.")
                        .version("v1.0.0")
                        .contact(new Contact().name("College Transit Engineering").email("transit-dev@college.edu"))
                        .license(new License().name("Apache 2.0").url("https://spring.io")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components().addSecuritySchemes("Bearer Authentication",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT access token generated via /api/v1/auth/login")));
    }
}
