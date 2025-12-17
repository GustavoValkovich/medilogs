import express from 'express';
import { DoctorPostgresRepository } from './doctor.postgres.repository.js';
import { DoctorController } from './doctor.controller.js';

const router = express.Router();
const repo = new DoctorPostgresRepository();
const controller = new DoctorController(repo);

router.get('/', controller.findAllDoctors);
router.get('/:id', controller.findDoctorById);

router.post('/', controller.addDoctor);
router.post('/login', controller.loginDoctor);

router.put('/:id', controller.updateDoctor);
router.patch('/:id', controller.partialUpdateDoctor);
router.delete('/:id', controller.deleteDoctor);

export default router;
