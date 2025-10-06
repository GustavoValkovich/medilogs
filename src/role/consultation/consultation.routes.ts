import express from 'express';
import { ConsultationPostgresRepository } from './consultation.postgres.repository.js';
import { Consultation } from './consultation.entity.js';
import auth, { AuthRequest } from '../../middlewares/auth.js';
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
router.post('/', auth.authenticateJWT, auth.requireRole('doctor'), async (req: AuthRequest, res) => {
	const data: Consultation = req.body;
	const patientId = data.patient_id;
	if (!patientId) return res.status(400).json({ message: 'patient_id es requerido' });

	const patient = await patientRepo.findOne(String(patientId));
	if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

	if (String(patient.doctor_id) !== String(req.user?.id)) return res.status(403).json({ message: 'No autorizado para crear consultas para este paciente' });

	// Force doctor_id to the authenticated doctor
	data.doctor_id = Number(req.user?.id);
	const created = await repo.add(data);
	if (!created) return res.status(500).json({ message: 'No se pudo crear la consulta' });
	res.status(201).json(created);
});

// PUT /:id - reemplazar consulta (solo doctor owner del paciente)
router.put('/:id', auth.authenticateJWT, auth.requireRole('doctor'), async (req: AuthRequest, res) => {
	const { id } = req.params;
	const data: Consultation = req.body;

	const existing = await repo.findOne(id);
	if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

	// determinar patient a validar: si viene en body usarlo, sino usar el existente
	const patientIdToCheck = data.patient_id ?? existing.patient_id;
	const patient = await patientRepo.findOne(String(patientIdToCheck));
	if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
	if (String(patient.doctor_id) !== String(req.user?.id)) return res.status(403).json({ message: 'No autorizado para modificar esta consulta' });

	// Prevent changing ownership: force doctor_id to existing value (or keep same)
	data.doctor_id = existing.doctor_id ?? Number(req.user?.id);
	const updated = await repo.update(id, data);
	if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
	res.json(updated);
});

// PATCH /:id - actualización parcial (solo doctor owner del paciente)
router.patch('/:id', auth.authenticateJWT, auth.requireRole('doctor'), async (req: AuthRequest, res) => {
	const { id } = req.params;
	const updates: Partial<Consultation> = req.body;

	const existing = await repo.findOne(id);
	if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

	// si se intenta cambiar patient_id, validar que el nuevo patient pertenezca al doctor
	const patientIdToCheck = updates.patient_id ?? existing.patient_id;
	const patient = await patientRepo.findOne(String(patientIdToCheck));
	if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
	if (String(patient.doctor_id) !== String(req.user?.id)) return res.status(403).json({ message: 'No autorizado para modificar esta consulta' });

	// Prevent changing doctor_id via partial update unless the current user is the same doctor
	if ((updates as any).doctor_id && String((updates as any).doctor_id) !== String(req.user?.id)) {
		return res.status(403).json({ message: 'No autorizado para cambiar doctor_id' });
	}
	// Ensure doctor_id remains the current owner
	(updates as any).doctor_id = existing.doctor_id ?? Number(req.user?.id);

	const updated = await repo.partialUpdate(id, updates);
	if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
	res.json(updated);
});

// DELETE /:id - eliminar consulta (solo doctor owner del paciente)
router.delete('/:id', auth.authenticateJWT, auth.requireRole('doctor'), async (req: AuthRequest, res) => {
	const { id } = req.params;
	const existing = await repo.findOne(id);
	if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

	const patient = await patientRepo.findOne(String(existing.patient_id));
	if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
	if (String(patient.doctor_id) !== String(req.user?.id)) return res.status(403).json({ message: 'No autorizado para eliminar esta consulta' });

	const ok = await repo.delete(id);
	if (!ok) return res.status(404).json({ message: 'Consulta no encontrada' });
	res.status(204).send();
});

export default router;