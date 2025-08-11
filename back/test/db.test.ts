import { Pool } from 'pg';

describe('Conexión a la base de datos PostgreSQL', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({
      user: process.env.DB_USER || 'medilogs',
      password: process.env.DB_PASSWORD || 'Medilogs335!',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'medilogs',
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('debe conectarse y hacer una consulta simple', async () => {
    const res = await pool.query('SELECT 1 as result');
    expect(res.rows[0].result).toBe(1);
  });
});
