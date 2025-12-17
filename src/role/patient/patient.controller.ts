import { Patient } from './patient.entity.js';
import { DomainError } from './domain-error.js';
import type { Request, Response } from 'express';

export class PatientController {
  constructor(private repo: {
    findAll: (doctorId?: number) => Promise<any[]>;
    findOne: (id: string) => Promise<any | null | undefined>;
    add: (p: any) => Promise<any | null | undefined>;
    update: (id: string, p: any) => Promise<any | null | undefined>;
    partialUpdate: (id: string, p: Partial<any>) => Promise<any | null | undefined>;
    delete: (id: string) => Promise<boolean>;
    softDelete: (id: string, deleted_at?: string) => Promise<any | null | undefined>;
    restore: (id: string) => Promise<any | null | undefined>;
  }) {
    this.findAllPatients = this.findAllPatients.bind(this);
    this.findPatientById = this.findPatientById.bind(this);
    this.addPatient = this.addPatient.bind(this);
    this.updatePatient = this.updatePatient.bind(this);
    this.partialUpdatePatient = this.partialUpdatePatient.bind(this);
    this.deletePatient = this.deletePatient.bind(this);
    this.softDeletePatient = this.softDeletePatient.bind(this);
    this.restorePatient = this.restorePatient.bind(this);
  }

  async findAllPatients(req: Request, res: Response) {
    const reqDoctorIdRaw =
      (req as any).headers?.['x-doctor-id'] ??
      (req as any).query?.doctor_id ??
      (req as any).body?.doctor_id;

    let doctorId: number | undefined = undefined;
    if (reqDoctorIdRaw !== undefined && reqDoctorIdRaw !== null) {
      const parsed = Number(reqDoctorIdRaw);
      if (!Number.isNaN(parsed)) doctorId = parsed;
    }

    const items = await this.repo.findAll(doctorId);
    return res.status(200).json(items ?? []);
  }

  async findPatientById(req: Request, res: Response) {
    const { id } = req.params;
    const found = await this.repo.findOne(id);
    if (!found) return res.status(404).json({ message: 'Paciente no encontrado' });

    const reqDoctorIdRaw =
      (req as any).headers?.['x-doctor-id'] ??
      (req as any).query?.doctor_id ??
      (req as any).body?.doctor_id;

    if (reqDoctorIdRaw !== undefined && reqDoctorIdRaw !== null) {
      const reqDoctorId = Number(reqDoctorIdRaw);
      if (
        found.doctor_id !== undefined &&
        found.doctor_id !== null &&
        !Number.isNaN(reqDoctorId) &&
        reqDoctorId !== Number(found.doctor_id)
      ) {
        return res.status(403).json({ message: 'Acceso denegado: paciente perteneciente a otro doctor' });
      }
    }

    return res.status(200).json(found);
  }

 async addPatient(req: Request, res: Response) {
  try {
    const entity = Patient.create(req.body);
    const created = await this.repo.add(entity);
    if (!created) return res.status(500).json({ message: 'No se pudo crear el paciente' });
    return res.status(201).json(created);
  } catch (err: any) {
    const code = err?.message || String(err);
    if (String(code).startsWith('INVALID_') || String(code).includes('BIRTH') || String(code).includes('FUTURE')) {
      return res.status(400).json({ message: 'Datos inválidos', code });
    }
    console.error('Error creating patient:', err);
    return res.status(500).json({ message: 'Error interno al crear paciente', error: err?.message || String(err) });
  }
}


 async updatePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const entity = Patient.create(req.body);
    const updated = await this.repo.update(id, entity);
    if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o no actualizado' });
    return res.status(200).json(updated);
  } catch (err: any) {
    const code = err?.message || String(err);
    if (String(code).startsWith('INVALID_') || String(code).includes('BIRTH') || String(code).includes('FUTURE')) {
      return res.status(400).json({ message: 'Datos inválidos', code });
    }
    return res.status(500).json({ message: 'Error interno al actualizar paciente', error: err?.message || String(err) });
  }
}

  async partialUpdatePatient(req: Request, res: Response) {
    const { id } = req.params;
    const updates = (req.body ?? {}) as Record<string, any>;

    const allowed = ['doctor_id','full_name','document','birth_date','notes','gender','insurance','email','city'];
    const keys = Object.keys(updates).filter((k) => allowed.includes(k));
    if (keys.length === 0) return res.status(400).json({ message: 'No hay campos actualizables' });

    const filtered: Record<string, any> = {};
    keys.forEach((k) => (filtered[k] = updates[k]));

    const updated = await this.repo.partialUpdate(id, filtered);
    if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o no actualizado' });
    return res.status(200).json(updated);
  }

  async deletePatient(req: Request, res: Response) {
    const { id } = req.params;
    const ok = await this.repo.delete(id);
    if (!ok) return res.status(404).json({ message: 'Paciente no encontrado' });
    return res.status(204).send();
  }

  async softDeletePatient(req: Request, res: Response) {
    const { id } = req.params;
    const { deleted_at } = req.body as { deleted_at?: string };

    try {
      const updated = await this.repo.softDelete(id, deleted_at);
      if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o ya eliminado' });
      return res.json(updated);
    } catch (err: any) {
      console.error('Error soft-deleting patient:', err);
      return res.status(500).json({
        message: 'Error interno al eliminar paciente',
        error: err?.message || String(err),
      });
    }
  }

  async restorePatient(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const restored = await this.repo.restore(id);
      if (!restored) return res.status(404).json({ message: 'Paciente no encontrado o no eliminado' });
      return res.json(restored);
    } catch (err: any) {
      console.error('Error restoring patient:', err);
      return res.status(500).json({
        message: 'Error interno al restaurar paciente',
        error: err?.message || String(err),
      });
    }
  }
}

export default PatientController;
