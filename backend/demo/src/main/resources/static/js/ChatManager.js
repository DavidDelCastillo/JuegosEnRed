export default class ChatManager {
    constructor() {
        this.chatContainer = $('#chat-container');
        this.chatMessages = $('#chat-messages');
        this.chatInput = $('#chat-input');
        this.chatSend = $('#chat-send');
        this.userCount = $('#users-count');

        this.lastMessageId = 0;
        this.userId = localStorage.getItem('chatUserId') || null;

        this.heartbeatInterval = null; // 🔧 CAMBIO
        
        // Listeners
        this.chatSend.on('click', () => this.sendMessage());
        this.chatInput.on('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.connectUser();
        this.startFetchingMessages();
        this.startFetchingUsers();
    }

    sendMessage() {
        const message = this.chatInput.val().trim();
        if (message) {
            $.post("/api/chat", { message, userId: this.userId })
                .done(() => {
                    this.chatInput.val('');
                    this.fetchMessages();
                })
                .fail(err => console.error('Error al enviar el mensaje:', err));
        }
    }

    fetchMessages() {
        $.get("/api/chat", { since: this.lastMessageId })
            .done((data) => {
                if (data.messages?.length) {
                    data.messages.forEach(msg => {
                        this.chatMessages.append(`<div>${msg.id}: ${msg.text}</div>`);
                    });
                    this.chatMessages.scrollTop(this.chatMessages.prop('scrollHeight'));
                    this.lastMessageId = data.timestamp;
                }
            })
            .fail(err => console.error('Error al obtener mensajes:', err));
    }

    fetchConnectedUsers() {
        $.get("/api/chat/activeClients")
            .done(count => {
                this.userCount.text(`Usuarios conectados: ${count}`);
            })
            .fail(err => console.error('Error al obtener usuarios:', err));
    }

    connectUser() {
        $.post("/api/chat/connect")
            .done((userId) => {
                this.userId = userId;
                localStorage.setItem('chatUserId', userId);

                console.log(`Usuario conectado con ID: ${userId}`);

                this.fetchConnectedUsers(); // 🔧 CAMBIO
                this.startHeartbeat();
            })
            .fail(err => console.error('Error al conectar usuario:', err));
    }

    disconnectUser() {
        if (!this.userId) return;

        navigator.sendBeacon( // 🔧 CAMBIO (más fiable que $.post en unload)
            "/api/chat/disconnect",
            JSON.stringify({ userId: this.userId })
        );
    }

    startHeartbeat() {
        if (this.heartbeatInterval) return; // 🔧 CAMBIO

        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 3000);
    }

    sendHeartbeat() {
        if (!this.userId) return;

        $.post("/api/chat/heartbeat", { userId: this.userId }) // 🔧 CAMBIO (chat, no char)
            .fail(err => console.error('Error en heartbeat:', err));
    }

    startFetchingMessages() {
        setInterval(() => this.fetchMessages(), 2000);
    }

    startFetchingUsers() {
        setInterval(() => this.fetchConnectedUsers(), 2000);
    }
}

$(document).ready(() => {
    const chatManager = new ChatManager();

    $(window).on('beforeunload', () => {
        chatManager.disconnectUser();
    });
});
