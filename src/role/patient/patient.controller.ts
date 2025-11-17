import type { Request, Response } from 'express';

export class PatientController {
  constructor(private repo: {
    findAll: (doctorId?: number) => Promise<any[]>;
    findOne: (id: string) => Promise<any | null | undefined>;
    add: (p: any) => Promise<any | null | undefined>;
    update: (id: string, p: any) => Promise<any | null | undefined>;
    partialUpdate: (id: string, p: Partial<any>) => Promise<any | null | undefined>;
    delete: (id: string) => Promise<boolean>;
  }) {
    this.findAllPatients = this.findAllPatients.bind(this);
    this.findPatientById = this.findPatientById.bind(this);
    this.addPatient = this.addPatient.bind(this);
    this.updatePatient = this.updatePatient.bind(this);
    this.partialUpdatePatient = this.partialUpdatePatient.bind(this);
    this.deletePatient = this.deletePatient.bind(this);
  }

  async findAllPatients(req: Request, res: Response) {
    const reqDoctorIdRaw = (req as any).headers?.['x-doctor-id'] ?? (req as any).query?.doctor_id ?? (req as any).body?.doctor_id;
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

    
    const reqDoctorIdRaw = (req as any).headers?.['x-doctor-id'] ?? (req as any).query?.doctor_id ?? (req as any).body?.doctor_id;
    if (reqDoctorIdRaw !== undefined && reqDoctorIdRaw !== null) {
      const reqDoctorId = Number(reqDoctorIdRaw);
      // Si el paciente tiene asociado un doctor_id y no coincide, negar acceso
      if (found.doctor_id !== undefined && found.doctor_id !== null && !Number.isNaN(reqDoctorId) && reqDoctorId !== Number(found.doctor_id)) {
        return res.status(403).json({ message: 'Acceso denegado: paciente perteneciente a otro doctor' });
      }
    }

    return res.status(200).json(found);
  }

  async addPatient(req: Request, res: Response) {
    const created = await this.repo.add(req.body);
    if (!created) return res.status(400).json({ message: 'No se pudo crear el paciente' });
    return res.status(201).json(created);
  }

  async updatePatient(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await this.repo.update(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o no actualizado' });
    return res.status(200).json(updated);
  }

  async partialUpdatePatient(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await this.repo.partialUpdate(id, req.body ?? {});
    if (!updated) return res.status(404).json({ message: 'Paciente no encontrado o no actualizado' });
    return res.status(200).json(updated);
  }

  async deletePatient(req: Request, res: Response) {
    const { id } = req.params;
    const ok = await this.repo.delete(id);
    if (!ok) return res.status(404).json({ message: 'Paciente no encontrado' });
    return res.status(204).send();
  }
}

export default PatientController;
