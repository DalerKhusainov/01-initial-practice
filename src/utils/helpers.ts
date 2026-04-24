import http from "http";

export function logger(req: http.IncomingMessage, next: () => void) {
  const { url, method } = req;
  console.log(`URL: "${url}" || Method: "${method}"`);
  next();
}
