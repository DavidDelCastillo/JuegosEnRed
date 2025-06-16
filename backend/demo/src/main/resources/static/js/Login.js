class LoginScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginScene' });
    }

    preload() {
        // carga de audios
        this.load.audio("boton", 'assets/Clickar_Boton.wav');

        // carga de imágenes
        this.load.image("fondo", 'assets/menu.png');
        this.load.image("libro", 'assets/Libro.png');
        this.load.image("volverB", 'assets/backbutton.png');
        this.load.image("sombraLibro", 'assets/SombraLibro.png');
        this.load.image("periodicoM", 'assets/Menu_inicialPeri.png');
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // montaje de la escena
        this.add.image(centerX, centerY, "fondo");
        this.add.image(0.618 * centerX, 1.2 * centerY, "sombraLibro");
        this.add.image(0.65 * centerX, 1.2 * centerY, "libro");

        // Recuadro usuario
        this.nombre = document.createElement('input');
        this.nombre.type = 'text';
        this.nombre.placeholder = 'Usuario';
        this.nombre.style.position = 'absolute';
        this.nombre.style.left = `${0.6 * centerX}px`;
        this.nombre.style.top = `${0.8 * centerY}px`;
        this.nombre.style.width = '200px';
        this.nombre.style.font = '40px mousy';
        this.nombre.style.backgroundColor = 'rgba(162, 208, 158, 0.39)';
        this.nombre.style.color = '#42240e';
        document.body.appendChild(this.nombre);

        // Recuadro contraseña
        this.contra = document.createElement('input');
        this.contra.type = 'password';
        this.contra.placeholder = 'Contraseña';
        this.contra.style.position = 'absolute';
        this.contra.style.left = `${0.6 * centerX}px`;
        this.contra.style.top = `${0.9 * centerY}px`;
        this.contra.style.width = '200px';
        this.contra.style.font = '40px mousy';
        this.contra.style.backgroundColor = 'rgba(162, 208, 158, 0.39)';
        this.contra.style.color = '#42240e';
        document.body.appendChild(this.contra);

        // Botones
        this.add.text(0.7 * centerX, 1.05 * centerY, 'Iniciar sesión', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
            .on('pointerdown', () => {
                this.IniciarSesion(this.nombre.value, this.contra.value);
            });

        this.add.text(0.7 * centerX, 1.25 * centerY, 'Registrarse', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
            .on('pointerdown', () => {
                this.registrar(this.nombre.value, this.contra.value);
            });

        this.add.text(0.7 * centerX, 1.45 * centerY, 'Eliminar', {
            font: '70px mousy',
            color: '#42240e',
            align: 'center'
        }).setInteractive()
            .on('pointerdown', () => {
                this.eliminarUsuario(this.nombre.value, this.contra.value);
            });

        const volverB = this.add.image(1.8 * centerX, 0.25 * centerY, "volverB")
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play("boton");
                if (this.callingScene) {
                    this.scene.stop("IntroLoScene");
                    this.returnToCallingScene();
                } else {
                    this.scene.start("GameModeScene");
                }
            });
        volverB.setScale(0.4);

        // guardar escena de llamada
        this.callingScene = this.scene.settings.data?.callingScene || null;

        // Eliminar inputs cuando la escena se cierre
        this.events.on('shutdown', this.removeInputs, this);
        this.events.on('destroy', this.removeInputs, this);

        window.addEventListener('beforeunload', () => {
            const user = localStorage.getItem('chatUsername');
            if (user) {
                const data = new Blob(
                    [JSON.stringify({ id: user })],
                    { type: 'application/json' }
                );

                navigator.sendBeacon('http://localhost:8080/usuario/cerrarSesion', data);

                localStorage.removeItem('chatUsername');
                localStorage.removeItem('chatId');
            }
        });
    }

    removeInputs() {
        if (this.nombre) {
            this.nombre.remove();
            this.nombre = null;
        }
        if (this.contra) {
            this.contra.remove();
            this.contra = null;
        }
    }

    returnToCallingScene() {
        if (this.callingScene) {
            this.scene.stop();
            this.scene.resume(this.callingScene);
        } else {
            console.error("No callingScene provided");
        }
    }

    IniciarSesion(user, password) {
        if (!user || !password) {
            alert("Por favor completa todos los campos.");
            return;
        }

        fetch("http://localhost:8080/usuario/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user, password: password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('chatId', user);
                    localStorage.setItem('chatUsername', user);
                    fetch("http://localhost:8080/api/chat/connect?id=" + encodeURIComponent(user), {
                        method: "POST"
                    })
                        .then(res => res.json())
                        .then(id => console.log("Conectado con ID:", id))
                        .catch(error => console.error("Error al conectar al chat:", error));

                    alert("Inicio de sesión exitoso");
                    this.scene.stop("LoginScene");
                    this.scene.start("IntroScene");
                    this.sound.play("boton");
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error en el login:", error);
                alert("Error al conectar con el servidor");
            });
    }

    registrar(nombre, contra) {
        if (!nombre || !contra) {
            alert("Por favor completa todos los campos.");
            return;
        }

        fetch("http://localhost:8080/usuario/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: nombre, password: contra })
        })
            .then(async response => {
                const data = await response.json().catch(() => ({}));
                if (response.ok && data.success) {
                    localStorage.setItem('chatId', nombre);
                    localStorage.setItem('chatUsername', nombre);
                    fetch("http://localhost:8080/api/chat/connect?id=" + encodeURIComponent(nombre), {
                        method: "POST"
                    })
                        .then(res => res.json())
                        .then(id => console.log("Conectado con ID:", id))
                        .catch(error => console.error("Error al conectar al chat:", error));

                    alert(data.message || "Usuario registrado correctamente");
                    this.scene.stop("LoginScene");
                    this.scene.start("IntroScene");
                    this.sound.play("boton");
                } else {
                    alert("Error: " + (data.message || "No se pudo registrar"));
                }
            })
            .catch(error => {
                console.error("Error en el registro:", error);
                alert("Error al conectar con el servidor");
            });
    }

    eliminarUsuario(nombre, contra) {
        if (!nombre || !contra) {
            alert("Por favor completa todos los campos.");
            return;
        }

        fetch("http://localhost:8080/usuario/eliminar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: nombre, password: contra })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message || "Usuario eliminado correctamente");
                    this.scene.stop("LoginScene");
                    this.scene.start("LoginScene");
                    this.sound.play("boton");
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error al eliminar usuario:", error);
                alert("Error al conectar con el servidor");
            });
    }
}
