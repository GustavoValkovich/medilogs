import express from 'express';
import bcrypt from 'bcryptjs';
import { DoctorPostgresRepository } from './doctor.postgres.repository.js';
import { Doctor } from './doctor.entity.js';

const router = express.Router();
const repo = new DoctorPostgresRepository();

// GET / - listar todos los doctores
router.get('/', async (req, res) => {
	const items = await repo.findAll();
	res.json(items || []);
});

// GET /:id - obtener un doctor
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const item = await repo.findOne(id);
	if (!item) return res.status(404).json({ message: 'Doctor no encontrado' });
	// Nunca devolver password
	if ((item as any).password) delete (item as any).password;
	res.json(item);
});

// POST / - crear doctor (hash password)
router.post('/', async (req, res) => {
	const data: Doctor = req.body;
	if (data.password) {
		const salt = await bcrypt.genSalt(10);
		data.password = await bcrypt.hash(data.password, salt);
	}
	const created = await repo.add(data);
	if (!created) return res.status(500).json({ message: 'No se pudo crear el doctor' });
	if ((created as any).password) delete (created as any).password;
	res.status(201).json(created);
});

// PUT /:id - reemplazar doctor (hash password si se proporciona)
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

// PATCH /:id - actualización parcial (whitelist de columnas)
router.patch('/:id', async (req, res) => {
	const { id } = req.params;
	const updates = req.body as Partial<Doctor>;

	// Whitelist de campos permitidos para actualizar parcialmente
	const allowed = ['first_name', 'last_name', 'specialty', 'phone', 'email', 'license_number', 'password'];
	const keys = Object.keys(updates).filter((k) => allowed.includes(k));

	if (keys.length === 0) return res.status(400).json({ message: 'No hay campos actualizables' });

	// Si password está en updates, hashearla
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

// DELETE /:id - eliminar doctor
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const deleted = await repo.delete(id);
	if (!deleted) return res.status(404).json({ message: 'Doctor no encontrado' });
	res.status(204).send();
});

export default router;