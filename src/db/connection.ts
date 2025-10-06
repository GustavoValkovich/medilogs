import pg from "pg";

const { Pool } = pg;

// Utilice variables de entorno cuando estén disponibles (más seguro
const poolConfig = {
  user: process.env.PGUSER || process.env.DB_USER || "postgres",
  host: process.env.PGHOST || process.env.DB_HOST || "localhost",
  database: process.env.PGDATABASE || process.env.DB_NAME || "medilogs",
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || "your_password",
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
};

// Crear un único "pool" de conexiones compartidas
export const pool = new Pool(poolConfig);
