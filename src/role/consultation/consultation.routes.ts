import express from 'express';
import { ConsultationPostgresRepository } from './consultation.postgres.repository.js';
import { PatientPostgresRepository } from '../patient/patient.postgres.repository.js';
import { ConsultationController } from './consultation.controller.js';


const router = express.Router();

const repo = new ConsultationPostgresRepository();
const patientRepo = new PatientPostgresRepository();
const controller = new ConsultationController(repo, patientRepo);

router.get('/', controller.findAllConsultations);
router.get('/:id', controller.findConsultationById);

router.post('/', controller.addConsultation);

router.put('/:id', controller.updateConsultation);
router.patch('/:id', controller.partialUpdateConsultation);
router.delete('/:id', controller.deleteConsultation);

router.post('/:id/soft-delete', controller.softDeleteConsultation);
router.post('/:id/restore', controller.restoreConsultation);

export default router;
