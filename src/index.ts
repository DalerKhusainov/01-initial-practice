import { createServer } from "./server";
const PORT = 8000;

const server = createServer();

server.listen(PORT, () => {
  console.log("Server running on PORT:", PORT);
});
