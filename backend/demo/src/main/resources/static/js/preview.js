class PreviewScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreviewScene' });
    }

    preload() {
        this.load.image('periodico', 'assets/periodico.png');
        this.load.image('chat', 'assets/backbutton.png');
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const myRole = this.registry.get("rol");
        const roomId = this.registry.get("room");

        // Crear y guardar socket en registry si no existe (evitar crear múltiples)
        if (!this.registry.get("socket")) {
            const socket = new WebSocket("ws://localhost:8080/ws/matchmaking");
            this.registry.set("socket", socket);

            // Cuando se abra la conexión, unirse a la cola de matchmaking
            socket.addEventListener('open', () => {
                socket.send("joinQueue");
            });
        }

        this.socket = this.registry.get("socket");

        // Fondo periódico
        this.add.image(centerX, centerY, 'periodico');

        // Título de la noticia
        this.add.text(0.65 * centerX, 0.6 * centerY,
            '¡Aumentan los sucesos paranormales en Villa Cheddar!', {
                font: '55px mousy',
                color: '#42240e',
                align: 'left',
                wordWrap: { width: 700 }
            });

        // Noticia
        this.add.text(0.65 * centerX, 0.85 * centerY,
            'VillaCheddar está en estado de alarma. Tras el reciente eclipse de Gazta Ilargia, un fenómeno que ocurre una vez cada cien años, ' +
            'los habitantes han sido testigos de un incremento alarmante en los eventos paranormales. Para combatir esta oleada de actividad sobrenatural, ' +
            'la alcaldesa ha contratado a Mystery Mice, la famosa empresa de cazarratafantasmas liderada por Sighttail y Scentpaw de la familia Arat. ' +
            '¿Serán capaces de poner fin a esta pesadilla?', {
                font: '40px mousy',
                color: '#42240e',
                align: 'left',
                wordWrap: { width: 700 }
            });

        // Variables de control para salto
        let cont = 0;
        let resetTimer = null;
        const resetTime = 500;
        const readingTime = 25000;

        const message = this.add.text(1.3 * centerX, 1.8 * centerY, '', {
            font: '50px mousy',
            color: '#FFFFFF',
            backgroundColor: '#000',
            align: 'center'
        });

        const handleSkip = () => {
            if (myRole !== "raton1") return;

            message.setText('Pulsa otra vez para saltar');
            cont++;

            if (cont > 1) {
                this.socket.send("nextScene:GameScene:"+roomId);
            } else {
                if (resetTimer) {
                    this.time.removeEvent(resetTimer);
                }
                resetTimer = this.time.delayedCall(resetTime, () => {
                    message.setText('');
                    cont = 0;
                    resetTimer = null;
                });
            }
        };

        this.input.on('pointerdown', handleSkip);
        this.input.keyboard.on('keydown-SPACE', handleSkip);

        if (myRole === "raton1") {
            this.time.delayedCall(readingTime, () => {
                this.socket.send("nextScene:GameScene:"+roomId);
            });
        }

        // Botón de chat
        this.add.image(1.9 * centerX, 0.2 * centerY, 'chat')
            .setScale(0.3)
            .setInteractive()
            .on('pointerdown', () => {
                document.getElementById('chat-container')?.classList.toggle('hidden');
            });

        // Escuchar mensajes WebSocket
        this.socket.addEventListener('message', (event) => {
            const msg = event.data;
            if (msg.startsWith("nextScene:")) {
                const nextScene = msg.split(":")[1];
                const msgRoomId = msg.split(":")[2];

                if(msgRoomId==roomId){
                    this.scene.stop("PreviewScene");
                    this.scene.start(nextScene);
                }
            }

            if (msg.startsWith("forceReturnToIntro")) {
                this.scene.stop("PreviewScene");
                this.scene.start("IntroScene");
            }
        });
    }
}
