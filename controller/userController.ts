import http from "http";
import { userService } from "../services/userService";
import { sendJSON, getRequestBody } from "../utils/json";

export const userController = {
  // GET /api/users - всех
  getAll(res: http.ServerResponse): void {
    const users = userService.getAllUsers();
    sendJSON(res, 200, users);
  },

  // GET /api/users?id=N - одного
  getById(res: http.ServerResponse, id: number): void {
    const user = userService.getUserById(id);

    if (!user) {
      sendJSON(res, 404, { error: "User not found" });
      return;
    }

    sendJSON(res, 200, user);
  },

  // POST /api/users - создать
  async create(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      const body = await getRequestBody(req);
      const { name, email } = body;

      if (!name || !email) {
        sendJSON(res, 400, { error: "name and email are required" });
        return;
      }
      const newUser = userService.createUser({
        name: String(name),
        email: String(email),
      });
      sendJSON(res, 201, newUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      const status = message.includes("email") ? 400 : 400;
      sendJSON(res, status, { error: message });
    }
  },

  // PUT /api/users?id=N - обновить
  async update(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    id: number
  ): Promise<void> {
    try {
      const body = await getRequestBody(req);
      const updates = body;

      const updatedUser = userService.updateUser(id, updates);

      if (!updatedUser) {
        sendJSON(res, 404, { error: "User not found" });
        return;
      }

      sendJSON(res, 200, updatedUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      sendJSON(res, 400, { error: message });
    }
  },

  // DELETE /api/users?id=N - удалить
  delete(res: http.ServerResponse, id: number): void {
    const deleted = userService.deleteUser(id);

    if (!deleted) {
      sendJSON(res, 400, { error: "User not found" });
      return;
    }

    sendJSON(res, 200, { message: "User deleted successfully" });
  },
};
