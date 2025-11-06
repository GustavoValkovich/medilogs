import express from 'express';
import { PatientPostgresRepository } from './patient.postgres.repository.js';
import { Patient } from './patient.entity.js';
import { PatientController } from './patient.controller.js';

const router = express.Router();
const repo = new PatientPostgresRepository();

const repoAdapter = {
  async findAll(): Promise<any[]> {
    const rows = await repo.findAll();
    return rows ?? [];
  },
  async findOne(id: string): Promise<any> {
    const row = await repo.findOne(id);
    return row ?? null;
  },
  async add(p: any): Promise<any> {
    return repo.add(p);
  },
  async update(id: string, p: any): Promise<any> {
    return repo.update(id, p);
  },
  async partialUpdate(id: string, p: Partial<any>): Promise<any> {
    return repo.partialUpdate(id, p);
  },
  async delete(id: string): Promise<any> {
    return repo.delete(id);
  },
};

const controller = new PatientController(repoAdapter);

router.get('/', controller.findAllPatients);
router.get('/:id', controller.findPatientById);

router.post('/', async (req, res) => {
  try {
    const data: Patient = req.body;
    const created = await repo.add(data);
    if (!created) return res.status(500).json({ message: 'No se pudo crear el paciente' });
    res.status(201).json(created);
  } catch (err: any) {
  console.error('Error creating patient:', err);
  return res.status(500).json({ message: 'Error interno al crear paciente', error: err?.message || String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data: Patient = req.body;
  const updated = await repo.update(id, data);
  if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o no actualizado' });
  res.json(updated);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body as Partial<Patient>;

  const allowed = ['doctor_id','full_name','document','birth_date','notes','gender','insurance','email','city'];
  const keys = Object.keys(updates).filter((k) => allowed.includes(k));
  if (keys.length === 0) return res.status(400).json({ message: 'No hay campos actualizables' });

  const filtered: Partial<Patient> = {};
  keys.forEach((k) => (filtered as any)[k] = (updates as any)[k]);

  const updated = await repo.partialUpdate(id, filtered);
  if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o no actualizado' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const ok = await repo.delete(id);
  if (!ok) return res.status(404).json({ message: 'Paciente no encontrado' });
  res.status(204).send();
});

export default router;
