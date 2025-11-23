package com.payment.config;

import io.micronaut.http.HttpMethod;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.Filter;
import io.micronaut.http.filter.HttpServerFilter;
import io.micronaut.http.filter.ServerFilterChain;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Flux;

@Filter("/**")
public class CorsFilter implements HttpServerFilter {

    @Override
    public Publisher<MutableHttpResponse<?>> doFilter(HttpRequest<?> request, ServerFilterChain chain) {
        if (request.getMethod() == HttpMethod.OPTIONS) {
            MutableHttpResponse<?> response = HttpResponse.ok();
            response.header("Access-Control-Allow-Origin", "http://localhost:3000");
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
            response.header("Access-Control-Allow-Headers", "*");
            response.header("Access-Control-Expose-Headers", "*");
            response.header("Access-Control-Allow-Credentials", "true");
            response.header("Access-Control-Max-Age", "3600");
            return Flux.just(response);
        }
        
        return Flux.from(chain.proceed(request))
            .doOnNext(response -> {
                response.header("Access-Control-Allow-Origin", "http://localhost:3000");
                response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
                response.header("Access-Control-Allow-Headers", "*");
                response.header("Access-Control-Expose-Headers", "*");
                response.header("Access-Control-Allow-Credentials", "true");
                response.header("Access-Control-Max-Age", "3600");
            });
    }
}
