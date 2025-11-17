import express from 'express';
import bcrypt from 'bcryptjs';
import { DoctorPostgresRepository } from './doctor.postgres.repository.js';
import { Doctor } from './doctor.entity.js';
import { DoctorController } from './doctor.controller.js';

const router = express.Router();
const repo = new DoctorPostgresRepository();
const controller = new DoctorController(repo);

router.get('/', controller.findAllDoctors);
router.get('/:id', controller.findDoctorById);

router.post('/', async (req, res) => {
  try {
    const data: Doctor = req.body;
    const required = ['first_name', 'last_name', 'specialty', 'license_number', 'password'];
    const missing = required.filter((f) => !(f in (data as any)) || (data as any)[f] === undefined || (data as any)[f] === '');
    if (missing.length > 0)
      return res.status(400).json({ message: 'Faltan campos requeridos', missing });

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const created = await repo.add(data);
    if (!created) {
      // Log generic failure (repo should log DB error). Return generic message to client.
      return res.status(500).json({ message: 'No se pudo crear el doctor' });
    }
    if ((created as any).password) delete (created as any).password;
    res.status(201).json(created);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('POST /api/doctors error:', (err as Error).message || err);
    res.status(500).json({ message: 'Error interno al crear doctor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'Email y password requeridos' });
  const all = await repo.findAll();
  const user = (all || []).find((d) => (d as any).email === email);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  const hashed = (user as any).password;
  const match = hashed ? await bcrypt.compare(password, hashed) : false;
  if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });
  const result = { ...user } as any;
  if (result.password) delete result.password;
  res.json({ user: result });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data: Doctor = req.body;
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }
  const updated = await repo.update(id, data);
  if (!updated) return res.status(404).json({ message: 'Doctor no encontrado o no actualizado' });
  if ((updated as any).password) delete (updated as any).password;
  res.json(updated);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body as Partial<Doctor>;
  const allowed = ['first_name','last_name','specialty','phone','email','license_number','password'];
  const keys = Object.keys(updates).filter((k) => allowed.includes(k));
  if (keys.length === 0) return res.status(400).json({ message: 'No hay campos actualizables' });
  if ((updates as any).password) {
    const salt = await bcrypt.genSalt(10);
    (updates as any).password = await bcrypt.hash((updates as any).password, salt);
  }
  const filtered: Partial<Doctor> = {};
  keys.forEach((k) => (filtered as any)[k] = (updates as any)[k]);
  const updated = await repo.partialUpdate(id, filtered);
  if (!updated) return res.status(404).json({ message: 'Doctor no encontrado o no actualizado' });
  if ((updated as any).password) delete (updated as any).password;
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleted = await repo.delete(id);
  if (!deleted) return res.status(404).json({ message: 'Doctor no encontrado' });
  res.status(204).send();
});

export default router;
