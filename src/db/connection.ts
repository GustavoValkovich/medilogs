import pg from "pg";

const { Pool } = pg;

const poolConfig = {
  user:
    process.env.PGUSER || process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  database:
    process.env.PGDATABASE || process.env.POSTGRES_DB || process.env.DB_NAME || 'medilogs',
  password:
    process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'postgres',
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
};

export const pool = new Pool(poolConfig);
