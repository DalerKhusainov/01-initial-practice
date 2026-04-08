import http from "http";

// Вспомогательная функция для отправки JSON-ответа
export function sendJSON(
  res: http.ServerResponse,
  statusCode: number,
  data: any
): void {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data));
}

// Чтение тела запроса (Promise-обёртка)
export function getRequestBody(req: http.IncomingMessage): Promise<any> {
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
