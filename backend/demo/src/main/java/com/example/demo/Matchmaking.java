package com.example.demo;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class Matchmaking extends TextWebSocketHandler {

    private final List<WebSocketSession> waitingPlayers = new ArrayList<>();
    //Creamos salas para que los mensajes no afecten a jugadores de otras partidas
    private final List<Room> rooms = new ArrayList<>();
    private int roomNum=0;

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

                //Id de la sesion
                String roomId = "room" + roomNum++;
                Room room = new Room(roomId, Arrays.asList(p1,p2));
                rooms.add(room);

                p1.sendMessage(new TextMessage("startGame:raton1:"+roomId));
                p2.sendMessage(new TextMessage("startGame:raton2:"+roomId));
            }
        }

        String payload = message.getPayload();
        if (payload.startsWith("nextScene:")) {
            Room room = findRoomForPlayer(session);
            if(room !=null){
                // Reenviar el mensaje a todos los jugadores emparejados con esta sala
                for (WebSocketSession s : room.getPlayers()) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(payload));
                    }
                }
            }
            
        }

        if (payload.startsWith("dialogueNext:")) {
            Room room = findRoomForPlayer(session);
            if(room !=null){
                // Reenviar el mensaje a todos los jugadores emparejados con esta sala
                for (WebSocketSession s : room.getPlayers()) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(payload));
                    }
                }
            }
            
        }

        if(payload.startsWith("positionUpdate:")){
            Room room = findRoomForPlayer(session);
            if(room !=null){
                // Reenviar el mensaje a todos los jugadores emparejados con esta sala
                for (WebSocketSession s : room.getPlayers()) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(payload));
                    }
                }
            }
        }
        if(payload.startsWith("newDialoge:")){
            Room room = findRoomForPlayer(session);
            if(room !=null){
                // Reenviar el mensaje a todos los jugadores emparejados con esta sala
                for (WebSocketSession s : room.getPlayers()) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(payload));
                    }
                }
            }
        }

        if(payload.startsWith("abilityOn:")){
            Room room = findRoomForPlayer(session);
            if(room !=null){
                // Reenviar el mensaje a todos los jugadores emparejados con esta sala
                for (WebSocketSession s : room.getPlayers()) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(payload));
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        waitingPlayers.remove(session);
        Room room = findRoomForPlayer(session);
        if (room != null) {
            room.getPlayers().remove(session);
            if (room.getPlayers().isEmpty()) {
                rooms.remove(room);
            }
        }
    }

    private Room findRoomForPlayer(WebSocketSession session) {
        for (Room room : rooms) {
            if (room.getPlayers().contains(session)) {
                return room;
            }
        }
        return null;
    }

    // Clase interna para representar una sala
    static class Room {
        private final String id;
        private final List<WebSocketSession> players;

        public Room(String id, List<WebSocketSession> players) {
            this.id = id;
            this.players = new ArrayList<>(players);
        }

        public String getId() {
            return id;
        }

        public List<WebSocketSession> getPlayers() {
            return players;
        }
    }
}
