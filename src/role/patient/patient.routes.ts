import express from 'express';
import { PatientPostgresRepository } from './patient.postgres.repository.js';
import { PatientController } from './patient.controller.js';

const router = express.Router();

const repo = new PatientPostgresRepository();

const repoAdapter = {
  async findAll(doctorId?: number) {
    const rows = await repo.findAll(doctorId);
    return rows ?? [];
  },
  async findOne(id: string) {
    const row = await repo.findOne(id);
    return row ?? null;
  },
  async add(p: any) {
    return repo.add(p);
  },
  async update(id: string, p: any) {
    return repo.update(id, p);
  },
  async partialUpdate(id: string, p: Partial<any>) {
    return repo.partialUpdate(id, p);
  },
  async delete(id: string) {
    return repo.delete(id);
  },
  async softDelete(id: string, deleted_at?: string) {
    return repo.softDelete(id, deleted_at);
  },
  async restore(id: string) {
    return repo.restore(id);
  },
};

const controller = new PatientController(repoAdapter);

router.get('/', controller.findAllPatients);
router.get('/:id', controller.findPatientById);

router.post('/', controller.addPatient);
router.put('/:id', controller.updatePatient);
router.patch('/:id', controller.partialUpdatePatient);
router.delete('/:id', controller.deletePatient);

router.post('/:id/soft-delete', controller.softDeletePatient);
router.post('/:id/restore', controller.restorePatient);

export default router;
