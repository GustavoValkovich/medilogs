import request from 'supertest';
import app from '../src/core/app';

describe('API Básica MediLogs', () => {
  it('GET /api/health debe responder 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('POST /api/auth/login debe fallar con credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'fake', password: 'fake' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
