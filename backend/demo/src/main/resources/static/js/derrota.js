class LoseScene extends Phaser.Scene{
    constructor(){
        super({key: 'LoseScene'});
    }

    preload(){
        //Cargamos las imagenes que componen el fondo
        this.load.image("fondoD", 'assets/Pantallla_Derrota.png');
        this.load.image("botonS", 'assets/VolverMenu.png');
        this.load.image("Boton_pipe", 'assets/Boton_pipe.png');

        //Cargamos el audio

        this.load.audio("metalpipe", 'assets/metalpipe.mp3');
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

        //Imagen del fondo
        const background_lose = this.add.image(centerX,centerY, "fondoD");

        //Texto derrota
        const LoseText = this.add.text(0.7*centerX, 0.3*centerY, 'La alcaldesa se ha salido con la suya',{
            font: '70px mousy',
            color: '#e4be9a',
            align: 'center',
            wordWrap: {width: 600}
        });

        //Botón del metal pipe
        const pipe = this.add.image(1 * centerX, 1.8 * centerY, "Boton_pipe").setInteractive().setScale(0.3)
            .on('pointerdown', () => {
                this.sound.play("metalpipe");
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
