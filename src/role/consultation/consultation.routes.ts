import express from 'express';
import { ConsultationPostgresRepository } from './consultation.postgres.repository.js';
import { Consultation } from './consultation.entity.js';

const router = express.Router();
const repo = new ConsultationPostgresRepository();

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

// POST / - crear consulta
router.post('/', async (req, res) => {
	const data: Consultation = req.body;
	const created = await repo.add(data);
	if (!created) return res.status(500).json({ message: 'No se pudo crear la consulta' });
	res.status(201).json(created);
});

// PUT /:id - reemplazar consulta
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const data: Consultation = req.body;
	const updated = await repo.update(id, data);
	if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
	res.json(updated);
});

// PATCH /:id - actualización parcial
router.patch('/:id', async (req, res) => {
	const { id } = req.params;
	const updates: Partial<Consultation> = req.body;
	const updated = await repo.partialUpdate(id, updates);
	if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
	res.json(updated);
});

// DELETE /:id - eliminar consulta
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const ok = await repo.delete(id);
	if (!ok) return res.status(404).json({ message: 'Consulta no encontrada' });
	res.status(204).send();
});

export default router;