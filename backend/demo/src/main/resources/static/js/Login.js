package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.Map;
@RestController
@RequestMapping("/usuario")
public class LoginController{
    /*private final UserRepository userRepository;

    public LoginController(UserRepository userRepository){
        this.userRepository=userRepository;
    }*/

    //Registrar Usuario
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario){
        try{
            String nombreUsuario = usuario.getId();
            String password = usuario.getPassword();
            File archivoGeneral =new File ("usuarios/usuarios.txt");
            File carpeta = new File("usuarios");

            if(!carpeta.exists()) carpeta.mkdirs(); //Sino existe la carpeta la crea
            
            // Verificar si el usuario ya existe
            if (archivoGeneral.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(archivoGeneral))) {
                    String linea;
                    while ((linea = reader.readLine()) != null) {
                        String[] partes = linea.split(",");
                        if (partes.length >= 1 && partes[0].equals(nombreUsuario)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("success", false, "message", "Este nombre ya existe"));
                        }
                    }
                }
            }
            //Guarda la información en uno general
            try(FileWriter write =new FileWriter(archivoGeneral, true)){
                write.write(nombreUsuario+","+password+",0\n");
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "message", "Usuario registrado correctamente"));

        } catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error al registrar usuario"));
        }
    }

    // Carga de usuario
    @PostMapping("/login")
    public ResponseEntity<?> loginUsuario(@RequestBody Usuario usuario) {
        String nombreUsuario = usuario.getId();
        String password = usuario.getPassword();
        File archivoGeneral = new File("usuarios/usuarios.txt");
        File carpeta = new File("usuarios");

        if(!carpeta.exists()) carpeta.mkdirs(); //Sino existe la carpeta la crea

        if (!archivoGeneral.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "No hay usuarios registrados"));
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(archivoGeneral))) {
            String linea;
            while ((linea = reader.readLine()) != null) {
                String[] partes = linea.split(",");
                if (partes.length >= 2 && partes[0].equals(nombreUsuario)) {
                    if (partes[1].equals(password)) {
                        return ResponseEntity.ok()
                                .body(Map.of("success", true, "message", "Inicio de sesión exitoso"));
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("success", false, "message", "Contraseña incorrecta"));
                    }
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al leer usuarios"));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "Usuario no encontrado"));
    }

    //Obtener usuario por id
    /*@GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuario(@PathVariable Integer id) {
        Optional<Usuario> usuario = userRepository.findById(id);
        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Usuario no encontrado"));
        }
    }*/

    //Eliminar usuario
    @PostMapping("/eliminar")
    public ResponseEntity<?> eliminarUsuario(@RequestBody Usuario usuario){

        String nombreUsuario = usuario.getId();
        String password = usuario.getPassword();
        File archivoGeneral = new File("usuarios/usuarios.txt");

        if (!archivoGeneral.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "No hay usuarios registrados"));
        }

        try {
            File tempFile = new File("usuarios/temp.txt");
            boolean usuarioEncontrado = false;

            try (
                BufferedReader reader = new BufferedReader(new FileReader(archivoGeneral));
                PrintWriter writer = new PrintWriter(new FileWriter(tempFile))
            ) {
                String linea;
                while ((linea = reader.readLine()) != null) {
                    String[] partes = linea.split(",");
                    if (partes.length >= 2 && partes[0].equals(nombreUsuario) && partes[1].equals(password)) {
                        usuarioEncontrado = true; // No lo escribimos en el archivo nuevo
                        continue;
                    }
                    writer.println(linea); // Mantener otros usuarios
                }
            }

            if (!usuarioEncontrado) {
                tempFile.delete(); // Limpieza
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Usuario no encontrado o contraseña incorrecta"));
            }

            // Reemplaza el archivo original
            if (!archivoGeneral.delete() || !tempFile.renameTo(archivoGeneral)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al actualizar archivo de usuarios"));
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Usuario eliminado correctamente"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error al eliminar usuario"));
        }
    }
}
