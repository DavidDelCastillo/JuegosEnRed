package com.example.demo;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;

@Component
public class Matchmaking extends TextWebSocketHandler {

    private final List<WebSocketSession> waitingPlayers = new ArrayList<>();

    @Override
    public synchronized void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        if (message.getPayload().equals("joinQueue")) {
            if (!waitingPlayers.contains(session)) {
                waitingPlayers.add(session);
                session.sendMessage(new TextMessage("Esperando usuarios:" + waitingPlayers.size() + "/2"));
            }

            if (waitingPlayers.size() == 2) {
                WebSocketSession p1 = waitingPlayers.remove(0);
                WebSocketSession p2 = waitingPlayers.remove(0);

                p1.sendMessage(new TextMessage("startGame:raton1"));
                p2.sendMessage(new TextMessage("startGame:raton2"));
            }
        }

        /*String payload = message.getPayload();
        if (payload.startsWith("nextScene:")) {
        // Reenviar el mensaje a todos los jugadores emparejados con este
            for (WebSocketSession s : activePlayers) {
                if (s.isOpen()) {
                    s.sendMessage(new TextMessage(payload));
                }
            }
        }*/
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        waitingPlayers.remove(session);
    }
}
