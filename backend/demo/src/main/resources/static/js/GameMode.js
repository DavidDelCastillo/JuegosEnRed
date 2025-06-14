class GameModeScene extends Phaser.Scene{
    constructor() {
        super({ key: 'GameModeScene' });
    }

    preload() {
        // carga de audios
        this.load.audio("boton", 'assets/Clickar_Boton.wav');

        //carga de imágenes
        this.load.image("fondo", 'assets/menu.png');
        this.load.image("libro", 'assets/Libro.png');
        this.load.image("sombraLibro", 'assets/SombraLibro.png');
        this.load.image("periodicoM", 'assets/Menu_inicialPeri.png');

    }

    create(){
        //variables para meter las imagenes a posteriori
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // montaje de la escena
        const background_menu = this.add.image(centerX, centerY, "fondo");
        // interfaz del libro
        const sombraLibro = this.add.image(0.618 * centerX, 1.2 * centerY, "sombraLibro");
        const libro = this.add.image(0.65 * centerX, 1.2 * centerY, "libro");

        //Botón para juego Local
        const localText = this.add.text(0.72*centerX, 0.8*centerY, 'Local',{
            font: '100px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
        .on('pointerdown', ()=>{
            this.scene.stop("GameModeScene");
            this.scene.start("IntroLoScene");     
        });

        //Boton para juego Online
        const onlineText = this.add.text(0.72*centerX, 1.2*centerY, 'Online',{
            font: '100px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
        .on('pointerdown', ()=>{
            this.scene.stop("GameModeScene");
            this.scene.start("LoginScene");    
        });
    }
}