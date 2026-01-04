package com.example.demo;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Permitir solicitudes desde cualquier origen
public class ChatController {

    private final List<ChatMessage> messages = new ArrayList<>();
    private final AtomicInteger lastId = new AtomicInteger(0);
    private final AtomicInteger userIdCounter = new AtomicInteger(0);
    private final ConcurrentHashMap<Integer, Long> activeUsers = new ConcurrentHashMap<>(); //otro mapa igual para los UserName


    @GetMapping
public ChatResponse getMessages(@RequestParam(defaultValue = "0") int since) {
    List<ChatMessage> newMessages = new ArrayList<>();
    int latestId = since;

    synchronized (messages) {
        for (ChatMessage msg : messages) {
            if (msg.id() > since) {
                newMessages.add(msg);
                latestId = msg.id();
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
        synchronized (messages) {
            messages.add(new ChatMessage(lastId.incrementAndGet(),userId,message));

            if (messages.size() > 50) {
                messages.remove(0); // Almacenar los últimos 50 mensajes
            }
        }
    }

    @PostMapping("/connect")
public int connectClient() {
    int userId = userIdCounter.incrementAndGet();
    activeUsers.put(userId, System.currentTimeMillis());
    System.out.println("Usuario conectado: " + userId);
    return userId;
}


    @PostMapping("/disconnect")
    public int disconnectClient(@RequestParam int userId) {
        activeUsers.remove(userId);
        return activeUsers.size();
    }

    @PostMapping("/heartbeat")
    public void heartbeat(@RequestParam int userId) {
        if(activeUsers.containsKey(userId)){
            activeUsers.put(userId, System.currentTimeMillis());
        }
    }
    

    @SpringBootApplication
    @EnableScheduling
    public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
        }
    }


    @Scheduled(fixedRate = 2000)
public void removeInactiveUsers() {
    long now = System.currentTimeMillis();

    activeUsers.forEach((userId, lastActive) -> {
        if (now - lastActive > 6000) { // 6 segundos sin heartbeat
            activeUsers.remove(userId);
            System.out.println("Usuario " + userId + " eliminado por timeout");
        }
    });
}


    public static class ChatResponse {
    private final List<ChatMessage> messages;
    private final int timestamp;

    public ChatResponse(List<ChatMessage> messages, int timestamp) {
        this.messages = messages;
        this.timestamp = timestamp;
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public int getTimestamp() {
        return timestamp;
    }
}

}
