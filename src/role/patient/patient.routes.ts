import express from 'express';
import { PatientPostgresRepository } from './patient.postgres.repository.js';
import { Patient } from './patient.entity.js';

const router = express.Router();
const repo = new PatientPostgresRepository();

// GET / - listar todos los pacientes
router.get('/', async (req, res) => {
	const items = await repo.findAll();
	res.json(items || []);
});

// GET /:id - obtener paciente
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const item = await repo.findOne(id);
	if (!item) return res.status(404).json({ message: 'Paciente no encontrado' });
	res.json(item);
});

// POST / - crear paciente
router.post('/', async (req, res) => {
	const data: Patient = req.body;
	const created = await repo.add(data);
	if (!created) return res.status(500).json({ message: 'No se pudo crear el paciente' });
	res.status(201).json(created);
});

// PUT /:id - reemplazar paciente
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const data: Patient = req.body;
	const updated = await repo.update(id, data);
	if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o no actualizado' });
	res.json(updated);
});

// PATCH /:id - actualización parcial (whitelist)
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

// DELETE /:id - eliminar paciente
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const ok = await repo.delete(id);
	if (!ok) return res.status(404).json({ message: 'Paciente no encontrado' });
	res.status(204).send();
});

export default router;