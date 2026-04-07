import http from "http";
import { parse } from "url";

// Типизация пользователя
interface User {
  id: number;
  name: string;
  email: string;
}

// Хранилище пользователей (в памяти)
let users: User[] = [
  { id: 1, name: "Ivan", email: "ivat@example.com" },
  { id: 2, name: "Maria", email: "maria@example.com" },
];

let nextId = 3; // следующий доступный ID

// Вспомогательная функция для отправки JSON-ответа
function sendJSON(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data));
}

// Получение ID из query-параметров
function getIdFromUrl(url: string | undefined): number | null {
  if (!url) return null;
  const parsed = parse(url, true);
  const id = parsed.query.id;
  return id ? Number(id) : null;
}

// Чтение тела запроса (Promise-обёртка)
function getRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// --- Обработчики маршрутов ---

// GET /api/users - список всех пользователей
function handleGetAllUsers(res: http.ServerResponse) {
  sendJSON(res, 200, users);
}

// GET /api/users?id=N - один пользователь
function handleGetUserById(res: http.ServerResponse, id: number) {
  const user = users.find((u) => u.id === id);
  if (!user) {
    sendJSON(res, 404, { error: "Пользователь не найден" });
    return;
  }
  sendJSON(res, 200, user);
}

// POST /api/users - создать пользователя
async function handleCreateUser(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  try {
    const body = await getRequestBody(req);
    const { name, email } = body;

    // Валидация
    if (!name || !email) {
      sendJSON(res, 400, { error: "Поля name и email обязательны" });
      return;
    }

    // Проверка уникальности email
    if (users.some((u) => u.email === email)) {
      sendJSON(res, 400, {
        error: "Пользователь с таким email уже существует",
      });
      return;
    }

    const newUser: User = {
      id: nextId++,
      name: String(name),
      email: String(email),
    };

    users.push(newUser);
    sendJSON(res, 201, newUser);
  } catch (error) {
    sendJSON(res, 400, { error: "Неверный формат JSON" });
  }
}

// PUT /api/users?id=N - обновить пользователя
async function handleUpdateUser(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  id: number
) {
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    sendJSON(res, 404, { error: "Пользователь не найден" });
    return;
  }

  try {
    const body = await getRequestBody(req);
    const { name, email } = body;

    // Проверка уникальности email (если он меняется)
    if (
      email &&
      email !== users[userIndex]?.email &&
      users.some((u) => u.email === email)
    ) {
      sendJSON(res, 400, {
        error: "Пользователь с таким email уже существует",
      });
      return;
    }

    users[userIndex] = {
      ...users[userIndex],
      id: id ?? users[userIndex]?.id,
      name: name ?? users[userIndex]?.name,
      email: email ?? users[userIndex]?.email,
    };

    sendJSON(res, 200, users[userIndex]);
  } catch (error) {
    sendJSON(res, 400, { error: "Неверный формат JSON" });
  }
}

// DELETE /api/users?id=N - удалить пользователя
function handleDeleteUser(res: http.ServerResponse, id: number) {
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    sendJSON(res, 400, { error: "Пользователь не найден" });
    return;
  }

  users.splice(userIndex, 1);
  sendJSON(res, 200, { message: "Пользователь удалён" });
}

// Главная страница (HTML)
function handleHome(res: http.ServerResponse) {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(`<h1>CRUD API на чистом Node.js</h1>
  <p>Доступные эндпоинты:</p>
  <ul>
    <li>GET /api/users - список всех пользователей</li>
    <li>GET /api/users?id=1 - получить пользователя по ID</li>
    <li>POST /api/users - создать (body: {"name": "...", "email": "..."})</li>
    <li>PUT /api/users?id=1 - обновить (body: {"name": "...", "email": "..."})</li>
    <li>DELETE /api/users?id=1 - удалить</li>
  </ul>`);
}

// Страница 404
function handleNotFound(res: http.ServerResponse) {
  sendJSON(res, 404, { error: "Маршрут не найден" });
}

// 405 Method Not Allowed
function handleMethodNotAllowed(res: http.ServerResponse) {
  sendJSON(res, 405, { error: "Метод не поддерживается для этого маршрута" });
}

// --- Основная маршрутизация ---
const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url || "", true);
  const pathname = parsedUrl.pathname;
  const method = req.method || "GET";

  // Обработка корневого маршрута
  if (pathname === "/" && method === "GET") {
    handleHome(res);
    return;
  }

  // API маршруты
  if (pathname === "/api/users") {
    const id = getIdFromUrl(req.url);

    switch (method) {
      case "GET":
        if (id !== null) {
          handleGetUserById(res, id);
        } else {
          handleGetAllUsers(res);
        }
        break;

      case "POST":
        if (id !== null) {
          // POST с ID в query — нестандартно, возвращаем 400
          sendJSON(res, 400, { error: "POST запрос не должен содержать id" });
        } else {
          await handleCreateUser(req, res);
        }
        break;

      case "PUT":
        if (id !== null) {
          await handleUpdateUser(req, res, id);
        } else {
          sendJSON(res, 400, { error: "PUT запрос требует параметр id" });
        }
        break;

      case "DELETE":
        if (id !== null) {
          handleDeleteUser(res, id);
        } else {
          sendJSON(res, 400, { error: "DELETE запрос требует параметр id" });
        }
        break;

      default:
        handleMethodNotAllowed(res);
    }
    return;
  }

  // Если маршрут не совпал
  handleNotFound(res);
});

server.listen(3000, () => {
  console.log("Сервер слушает порт 3000");
});
