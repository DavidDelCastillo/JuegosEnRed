class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
        // Carga de audios
        this.load.audio("boton", 'assets/Clickar_Boton.wav');
        this.load.audio("musicaFondo", 'assets/musicMenu.mp3');
        this.load.image("chat", 'assets/Boton_Chat.png');

        // Carga de imágenes
        this.load.image("fondo", 'assets/menu.png');
        this.load.image("libro", 'assets/Libro.png');
        this.load.image("sombraLibro", 'assets/SombraLibro.png');
        this.load.image("periodicoM", 'assets/Menu_inicialPeri.png');

        $(document).ready(function () {
            console.log("El DOM está cargado");
        });
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // WebSocket para iniciar partidas
        this.socket = new WebSocket("ws://localhost:8080/ws/matchmaking");

        // Música de fondo
        if (!this.sound.get('musicaFondo')) {
            this.music = this.sound.add("musicaFondo", { loop: true, volume: 0.5 });
            this.music.play();
            this.registry.set("musicaFondo", this.music);
        } else {
            this.music = this.sound.get('musicaFondo');
        }

        // Fondo y elementos del menú
        this.add.image(centerX, centerY, "fondo");

        this.add.text(0.1 * centerX, 0.05 * centerY, 'Mystery Mice', {
            font: '200px mousy',
            color: '#CDC1BF',
            backgroundColor: '#42240e80',
            align: 'center'
        });

        this.add.image(0.618 * centerX, 1.2 * centerY, "sombraLibro");
        this.add.image(0.65 * centerX, 1.2 * centerY, "libro");
        this.add.image(centerX, centerY, "periodicoM");

        // Botón de chat
        this.add.image(1.85 * centerX, 1.8 * centerY, 'chat')
            .setScale(0.3)
            .setInteractive()
            .on('pointerdown', () => {
                $('#chat-container').toggle();
            });

        // Botón "Empezar"
        this.add.text(0.72 * centerX, 0.65 * centerY, 'Empezar', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
            .on('pointerdown', () => {
                this.socket.send("joinQueue");
                this.waitingText.setText("Esperando usuarios ...");
                this.sound.play("boton");
            });

        // Texto de espera de partida
        this.waitingText = this.add.text(0.32*centerX, 0.52*centerY + 300, '', {
            font: '50px mousy',
            color: '#F0FFFF'
        }).setOrigin(0.5);

        // Botón "Controles"
        this.add.text(0.72 * centerX, 0.9 * centerY, 'Controles', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
            .on('pointerdown', () => {
                this.scene.pause("IntroScene");
                this.scene.launch('ControlScene', { callingScene: this.scene.key });
                this.sound.play("boton");
            });

        // Botón "Créditos"
        this.add.text(0.72 * centerX, 1.15 * centerY, 'Créditos', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
            .on('pointerdown', () => {
                this.scene.pause("IntroScene");
                this.scene.launch('CreditScene', { callingScene: this.scene.key });
                this.sound.play("boton");
            });

        // Botón "Cerrar sesión"
        this.add.text(0.66 * centerX, 1.4 * centerY, 'Cerrar Sesión', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
            .on('pointerdown', () => {
            this.sound.play("boton");

            if (window.chatManager) {
                window.chatManager.disconnectUser();
            }

            const username = localStorage.getItem('chatUsername');
            if (username) {
                fetch('http://localhost:8080/usuario/cerrarSesion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: username })
                })
            .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error cerrando sesión:', error));
            }

            localStorage.removeItem('chatUserId');
            localStorage.removeItem('chatId');

            this.scene.stop("IntroScene");
            this.scene.start("LoginScene");
        });


        // Eventos del WebSocket
        this.socket.onmessage = (event) => {
            if (event.data.startsWith("Esperando usuarios:")) {
                this.waitingText.setText(event.data);
            } else if (event.data.startsWith("startGame:")) {
                const myRole = event.data.split(":")[1];
                const roomId =event.data.split(":")[2];
                this.registry.set("rol", myRole);
                this.registry.set("room", roomId);
                this.registry.set("socket", this.socket);
                this.waitingText.setText("¡Partida encontrada!");
                this.scene.stop("IntroScene");
                this.scene.start("PreviewScene");
            }
        };
    }
}
