package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.Map;

@RestController
@RequestMapping("/usuario")
public class LoginController {

    // Registrar Usuario
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            String nombreUsuario = usuario.getId();
            String password = usuario.getPassword();
            File archivoGeneral = new File("usuarios/usuarios.txt");
            File carpeta = new File("usuarios");

            if (!carpeta.exists()) carpeta.mkdirs();

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

            try (FileWriter write = new FileWriter(archivoGeneral, true)) {
                write.write(nombreUsuario + "," + password + ",1\n");
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Usuario registrado correctamente"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al registrar usuario"));
        }
    }

    // Login de usuario
    @PostMapping("/login")
    public ResponseEntity<?> loginUsuario(@RequestBody Usuario usuario) {
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
            boolean loginCorrecto = false;
            boolean sesionActiva = false;

            try (BufferedReader reader = new BufferedReader(new FileReader(archivoGeneral));
                 PrintWriter writer = new PrintWriter(new FileWriter(tempFile))) {

                String linea;
                while ((linea = reader.readLine()) != null) {
                    String[] partes = linea.split(",");
                    if (partes.length >= 3 && partes[0].equals(nombreUsuario)) {
                        usuarioEncontrado = true;

                        if (partes[1].equals(password)) {
                            loginCorrecto = true;

                            if (partes[2].equals("1")) {
                                sesionActiva = true;
                                writer.println(linea);
                            } else {
                                writer.println(partes[0] + "," + partes[1] + ",1");
                            }
                        } else {
                            writer.println(linea);
                        }
                    } else {
                        writer.println(linea);
                    }
                }
            }

            if (!usuarioEncontrado) {
                tempFile.delete();
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Usuario no encontrado"));
            }

            if (!loginCorrecto) {
                tempFile.delete();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Contraseña incorrecta"));
            }

            if (sesionActiva) {
                tempFile.delete();
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("success", false, "message", "Este usuario ya tiene una sesión iniciada"));
            }

            if (!archivoGeneral.delete() || !tempFile.renameTo(archivoGeneral)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "message", "Error al actualizar archivo de usuarios"));
            }

            return ResponseEntity.ok()
                    .body(Map.of("success", true, "message", "Inicio de sesión exitoso"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al leer usuarios"));
        }
    }

    // Eliminar usuario
    @PostMapping("/eliminar")
    public ResponseEntity<?> eliminarUsuario(@RequestBody Usuario usuario) {
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

            try (BufferedReader reader = new BufferedReader(new FileReader(archivoGeneral));
                 PrintWriter writer = new PrintWriter(new FileWriter(tempFile))) {

                String linea;
                while ((linea = reader.readLine()) != null) {
                    String[] partes = linea.split(",");
                    if (partes.length >= 2 && partes[0].equals(nombreUsuario) && partes[1].equals(password)) {
                        usuarioEncontrado = true;
                        continue;
                    }
                    writer.println(linea);
                }
            }

            if (!usuarioEncontrado) {
                tempFile.delete();
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Usuario no encontrado o contraseña incorrecta"));
            }

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

    // Cerrar sesión (pone estado a 0)
    @PostMapping("/cerrarSesion")
    public ResponseEntity<?> cerrarSesion(@RequestBody(required = false) Map<String, Object> payload) {
        if (payload == null || !payload.containsKey("id")) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Falta el ID del usuario"
            ));
        }

        String nombreUsuario = payload.get("id").toString();
        File archivoGeneral = new File("usuarios/usuarios.txt");

        if (!archivoGeneral.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "No hay usuarios registrados"
            ));
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
                    if (partes.length >= 3 && partes[0].equals(nombreUsuario)) {
                        usuarioEncontrado = true;
                        writer.println(partes[0] + "," + partes[1] + ",0");  // Cierra sesión
                    } else {
                        writer.println(linea);
                    }
                }
            }

            if (!usuarioEncontrado) {
                tempFile.delete();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }

            if (!archivoGeneral.delete() || !tempFile.renameTo(archivoGeneral)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error al actualizar archivo de usuarios"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sesión cerrada correctamente"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error al cerrar sesión"
            ));
        }
    }
}
