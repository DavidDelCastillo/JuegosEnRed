package com.example.demo;

import java.util.concurrent.ConcurrentHashMap;
//en el caso de nombre de usuario seria string username
public record ChatMessage(int id, String text) {

    public int getId(){
        return id;
    }

    public String getText(){
        return text;
    }

}


