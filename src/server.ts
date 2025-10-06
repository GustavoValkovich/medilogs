// src/server.ts
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Medilogs API is running on port ${PORT}`);
});
