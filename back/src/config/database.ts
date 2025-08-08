import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
  user: process.env.DB_USER || 'medilogs',
  password: process.env.DB_PASSWORD || 'Medilogs335!',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medilogs',
  // Configuraciones adicionales para producción
  max: 20, // máximo número de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

// Event listeners para monitoreo
pool.on('connect', () => {
  console.log('✅ Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
});

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('🔗 Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
};

// Función para ejecutar queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 PostgreSQL Query ejecutado:', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error en PostgreSQL query:', { text: text.substring(0, 100), error: errorMessage });
    throw error;
  }
};

export default pool;
