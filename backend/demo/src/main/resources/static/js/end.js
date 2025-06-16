class EndScene extends Phaser.Scene{
    constructor(){
        super({key:'EndScene'});
    }

    preload(){

        //Cargamos el periódico como imagen de fondo
        this.load.image("periodicoF", 'assets/periodico.png');
        this.load.image("botonS", 'assets/VolverMenu.png');
    }

    create(){
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

        //variables para meter las imagenes a posteriori
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        //Colocamos la imagen
        this.periodicoF = this.add.image(centerX, centerY, 'periodicoF');

        //Añadimos el texto con el mensaje final
        this.textoF = this.add.text(0.75*centerX, centerY, 'Fin... ¿O no?', {
            font: '120px mousy',
            color: '#42240e',
            align: 'center'
        });

        //Botón para volver al menú inicial
        const volver = this.add.image(1 * centerX, 1.4 * centerY, "botonS").setInteractive()
            .on('pointerdown', () => {
                if (this.socket && this.socket.connected) {
                    this.socket.send("leaveRoom");
                }
                this.scene.stop("LoseScene");
                this.scene.start("IntroScene");
            });
    }
}