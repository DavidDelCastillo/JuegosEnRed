# Métodos REST implementados y su función

## ChatController

- **GET /api/chat?since={id}**  
  Obtener mensajes nuevos desde el id indicado.

- **GET /api/chat/activeClients**  
  Obtener número de usuarios activos conectados al chat.

- **POST /api/chat**  
  Enviar un mensaje al chat. Parámetros: `message`, `userId`.

- **POST /api/chat/connect**  
  Registrar conexión de un usuario. Parámetro: `id` (nombre de usuario). Devuelve `userId` asignado.

- **POST /api/chat/disconnect**  
  Desconectar usuario del chat. Parámetros: `userId`, `id` (nombre de usuario).

- **POST /api/chat/heartbeat**  
  Actualizar el estado de actividad del usuario. Parámetro: `userId`.

---

## LoginController

- **POST /usuario/registro**  
  Registrar un nuevo usuario. JSON body: `{ "id": String, "password": String }`.

- **POST /usuario/login**  
  Login de usuario. JSON body: `{ "id": String, "password": String }`.

- **POST /usuario/eliminar**  
  Eliminar usuario. JSON body: `{ "id": String, "password": String }`.

- **POST /usuario/cerrarSesion**  
  Cerrar sesión de un usuario. JSON body: `{ "id": String }`.
