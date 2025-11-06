import express from 'express';
import { ConsultationPostgresRepository } from './consultation.postgres.repository.js';
import { Consultation } from './consultation.entity.js';
import { PatientPostgresRepository } from '../patient/patient.postgres.repository.js';

const router = express.Router();
const repo = new ConsultationPostgresRepository();
const patientRepo = new PatientPostgresRepository();

// GET / - listar todas las consultas
router.get('/', async (req, res) => {
	const items = await repo.findAll();
	res.json(items || []);
});

// GET /:id - obtener una consulta
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const item = await repo.findOne(id);
	if (!item) return res.status(404).json({ message: 'Consulta no encontrada' });
	res.json(item);
});

// POST / - crear consulta (solo doctor owner del paciente)
router.post('/', async (req, res) => {
	const data: Consultation = req.body;
	const patientId = data.patient_id;
	if (!patientId) return res.status(400).json({ message: 'patient_id es requerido' });

	const patient = await patientRepo.findOne(String(patientId));
	if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    
	const created = await repo.add(data);
	if (!created) return res.status(500).json({ message: 'No se pudo crear la consulta' });
	res.status(201).json(created);
});

// PUT /:id - reemplazar consulta (solo doctor owner del paciente)
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const data: Consultation = req.body;

	const existing = await repo.findOne(id);
	if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

	data.doctor_id = data.doctor_id ?? existing.doctor_id;
	const updated = await repo.update(id, data);
	if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
	res.json(updated);
});

// PATCH /:id - actualización parcial (solo doctor owner del paciente)
router.patch('/:id', async (req, res) => {
	const { id } = req.params;
	const updates: Partial<Consultation> = req.body;

	const existing = await repo.findOne(id);
	if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

	(updates as any).doctor_id = (updates as any).doctor_id ?? existing.doctor_id;

	const updated = await repo.partialUpdate(id, updates);
	if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
	res.json(updated);
});

// DELETE /:id - eliminar consulta (solo doctor owner del paciente)
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const existing = await repo.findOne(id);
	if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

    
	const ok = await repo.delete(id);
	if (!ok) return res.status(404).json({ message: 'Consulta no encontrada' });
	res.status(204).send();
});

export default router;