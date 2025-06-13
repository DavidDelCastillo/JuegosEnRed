package com.example.demo;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class WebsocketEchoHandler extends TextWebSocketHandler {
    @Override
    protected void handleTextMessage(
        WebSocketSession session,
        TextMessage message) throws Exception {
            System.out.println("Message received: " +
            message.getPayload());
            String msg = message.getPayload();
            session.sendMessage(new TextMessage(msg));
    }
}
