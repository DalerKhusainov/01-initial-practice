import http from "http";

export function sendJSON(
  res: http.ServerResponse,
  statusCode: number,
  data: any
) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = statusCode;
  res.write(JSON.stringify(data));
  res.end();
}
