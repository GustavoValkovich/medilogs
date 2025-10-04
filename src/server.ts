// src/server.ts
import app from "./app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`[medilogs] listening on http://localhost:${PORT}`);
});