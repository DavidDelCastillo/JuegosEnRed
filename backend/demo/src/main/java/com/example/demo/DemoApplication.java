package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;


@SpringBootApplication
@EnableWebSocket
public class DemoApplication implements WebSocketConfigurer {
	

	@Override
	public void registerWebSocketHandlers(
		WebSocketHandlerRegistry registry) {
		registry.addHandler(echoHandler(), "/echo")
		.setAllowedOrigins("*");

		registry.addHandler(matchmaking(),"/ws/matchmaking").setAllowedOrigins("*");
	}
	@Bean
	public WebsocketEchoHandler echoHandler() {
		return new WebsocketEchoHandler();
	}

	@Bean
    public Matchmaking matchmaking() {
        return new Matchmaking();
    }
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
