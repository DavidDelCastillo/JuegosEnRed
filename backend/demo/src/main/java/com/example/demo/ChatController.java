package com.example.demo;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Permitir solicitudes desde cualquier origen
public class ChatController {

    private final List<ChatMessage> messages = new ArrayList<>();
    private final AtomicInteger lastId = new AtomicInteger(0);
    private final AtomicInteger userIdCounter = new AtomicInteger(0);
    private final ConcurrentHashMap<Integer, String> userNames = new ConcurrentHashMap<>();//mapa para asociar nombres con id
    private final ConcurrentHashMap<Integer, Long> activeUsers = new ConcurrentHashMap<>(); //otro mapa igual para los UserName


    @GetMapping
    public ChatResponse getMessages(@RequestParam(defaultValue = "0") int since) {
        List<String> newMessages = new ArrayList<>();
        int latestId = since;

        synchronized (messages) {
            for (ChatMessage msg : messages) {
                if (msg.getId() > since) {
                    newMessages.add(msg.getText());
                    latestId = msg.getId();
                }
            }
        }
        return new ChatResponse(newMessages, latestId);
    }

    @GetMapping("/activeClients")
    public int getActiveClients() {
        return activeUsers.size();
    }

    @PostMapping
    public void postMessage(@RequestParam String message, @RequestParam int userId) {
        String name=userNames.getOrDefault(userId, String.valueOf(userId));
        synchronized (messages) {
            messages.add(new ChatMessage(lastId.incrementAndGet(), name + ": " + message));
            if (messages.size() > 50) {
                messages.remove(0); // Almacenar los últimos 50 mensajes
            }
        }
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connectClient(@RequestParam String id) {
        int userId = userIdCounter.incrementAndGet();
        activeUsers.put(userId,System.currentTimeMillis());
        //Asociamos la id con el nombre
        userNames.put(userId,id);

        //Mensaje conexión
        synchronized (messages){
            messages.add(new ChatMessage(lastId.incrementAndGet(), id+ " se ha conectado."));
        }
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/disconnect")
    public int disconnectClient(@RequestParam int userId, @RequestParam String id) {
        activeUsers.remove(userId);
        userNames.remove(userId); //Lo borra
        //Mensaje desconexión
        synchronized (messages){
            messages.add(new ChatMessage(lastId.incrementAndGet(), id+ " se ha desconectado."));
        }
        return activeUsers.size();
    }

    @PostMapping("/heartbeat")
    public void heartbeat(@RequestParam int userId) {
        if(activeUsers.containsKey(userId)){
            activeUsers.put(userId, System.currentTimeMillis());
        }
    }
    
    @Scheduled(fixedRate = 15000) // Cada 2 segundos
    public void removeInactiveUsers() {
        long currentTime = System.currentTimeMillis();
        activeUsers.forEach((userId, lastActive) -> {
            if (currentTime - lastActive > 10000) { // Más de 10 segundos inactivo
                activeUsers.remove(userId);
                System.out.println("Usuario " + userId + " desconectado por inactividad");
            }
        });
    }

    public static class ChatResponse {
        private final List<String> messages;
        private final int timestamp;

        public ChatResponse(List<String> messages, int timestamp) {
            this.messages = messages;
            this.timestamp = timestamp;
        }

        public List<String> getMessages() {
            return messages;
        }

        public int getTimestamp() {
            return timestamp;
        }
    }
}
