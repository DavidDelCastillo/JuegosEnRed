class IntroScene extends Phaser.Scene{
    constructor(){
        super({key: 'IntroScene'});
    }

    

    preload(){
        // carga de audios
        this.load.audio("boton", 'assets/Clickar_Boton.wav');
        this.load.audio("musicaFondo", 'assets/musicMenu.mp3');
        this.load.image("chat", 'assets/Boton_Chat.png');

        //carga de imágenes
        this.load.image("fondo", 'assets/menu.png');
        this.load.image("libro", 'assets/Libro.png');
        this.load.image("sombraLibro", 'assets/SombraLibro.png');
        this.load.image("periodicoM", 'assets/Menu_inicialPeri.png');
        $(document).ready(function(){
            console.log("El DOM está cargado")
            // Acciones sobre el documento
            });
            
    }

    create(){
        //variables para meter las imagenes a posteriori
        const centerX = this.scale.width/2;
        const centerY = this.scale.height/2;

        //Implementamos el websocker de iniciar partidas
        this.socket = new WebSocket("ws://localhost:8080/ws/matchmaking");
        
                
        // activacion de sonidos
        if (!this.sound.get('musicaFondo')) {
            this.music = this.sound.add("musicaFondo", { loop: true, volume: 0.5 });
            this.music.play();
            this.registry.set("musicaFondo", this.music);
        } else {//Si estamos en otra escena y volvemos no se vuelve a poner la música que ya estaba, se deja como está
            this.music = this.sound.get('musicaFondo');
        }

        // montaje de la escena
        const background_menu = this.add.image(centerX,centerY, "fondo");

        //Texto con el título
        const title = this.add.text(0.1*centerX, 0.05*centerY, 'Mystery Mice', {
            font: '200px mousy',
            color: '#CDC1BF',
            backgroundColor: '#42240e80',
            align: 'center'
        });


        // interfaz del libro
        const sombraLibro = this.add.image(0.618*centerX, 1.2*centerY, "sombraLibro");
        const libro = this.add.image(0.65*centerX, 1.2*centerY, "libro");
        
        //Imagen del periodico
        this.periodicoM = this.add.image(centerX, centerY, "periodicoM");

        //boton del chat
        const chatButton = this.add.image(1.85*centerX, 1.8*centerY, 'chat').setScale(0.3)
            .setInteractive()
            .on('pointerdown', () =>{
                $('#chat-container').toggle();
        });

        // botones del menú
        //Botón para iniciar el juego
        const startText = this.add.text(0.72*centerX, 0.65*centerY, 'Empezar',{
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
        .on('pointerdown', ()=>{
            this.socket.send("joinQueue");
            this.waitingText.setText("Esperando usuarios ...");           
            this.sound.play("boton");
        });
        let myRole=null;

        this.socket.onmessage = (event) => {
            if (event.data.startsWith("Esperando usuarios:")) {
                const msg = event.data;
                this.waitingText.setText(msg); 
            } else if (event.data === "startGame") {
                this.waitingText.setText("¡Partida encontrada!");
                myRole = msg.split(":")[1];  // "raton1" o "raton2"
                this.registry.set("rol", myRole);// Guarda esto de forma global si lo necesitas luego
                this.scene.stop("IntroScene");
                this.scene.start("PreviewScene"); // o la escena real del juego
            }
        };

        //Cuadro de texto
        this.waitingText = this.add.text(centerX, centerY + 300, '', {
            font: '50px mousy',
            color: '##42240e'
        }).setOrigin(0.5);

        //Botón para cambiar de escena a la de los controles
        const textControl = this.add.text(0.72*centerX, 0.9*centerY, 'Controles', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
        .on('pointerdown', () =>{
            this.scene.pause("IntroScene");
            this.scene.launch('ControlScene', { callingScene: this.scene.key });
            this.sound.play("boton");
        });

        //Botón para cambiar de escena a la de créditos
        const textCredit = this.add.text(0.72*centerX, 1.15*centerY, 'Créditos', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
        .on('pointerdown', () =>{
            this.scene.pause("IntroScene");
            this.scene.launch('CreditScene', { callingScene: this.scene.key });
            this.sound.play("boton");
        });

        //Botón para cerrar sesión
        const exitText = this.add.text(0.66*centerX, 1.4*centerY, 'Cerrar Sesión', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
        .on('pointerdown', ()=> {
            this.sound.play("boton");

            // Desconectar usuario si el chat está inicializado
            if (window.chatManager) {
                window.chatManager.disconnectUser();
            }

            // Limpiar localStorage de la sesión
            localStorage.removeItem('chatUserId');
            localStorage.removeItem('chatId');

            // Parar escena actual e ir a LoginScene
            this.scene.stop("IntroScene");
            this.scene.start("LoginScene");
        });


        
    }

    
}
