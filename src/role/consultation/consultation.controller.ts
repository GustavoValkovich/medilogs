import { Consultation } from './consultation.entity.js';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../shared/http-error.js';


export class ConsultationController {
  constructor(
    private repo: any,
    private patientRepo: any
  ) {
    this.findAllConsultations = this.findAllConsultations.bind(this);
    this.findConsultationById = this.findConsultationById.bind(this);
    this.addConsultation = this.addConsultation.bind(this);
    this.updateConsultation = this.updateConsultation.bind(this);
    this.partialUpdateConsultation = this.partialUpdateConsultation.bind(this);
    this.deleteConsultation = this.deleteConsultation.bind(this);
    this.softDeleteConsultation = this.softDeleteConsultation.bind(this);
    this.restoreConsultation = this.restoreConsultation.bind(this);
  }

  async findAllConsultations(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await this.repo.findAll();
    return res.status(200).json(items ?? []);
  } catch (err) {
    return next(err);
  }
  }

  async findConsultationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const item = await this.repo.findOne(id);

    if (!item) throw new HttpError(404, 'Consulta no encontrada', 'CONSULTATION_NOT_FOUND');

    return res.status(200).json(item);
  } catch (err) {
    return next(err);
  }
  }


async addConsultation(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = Consultation.create(req.body);

    const patient = await this.patientRepo.findOne(String(entity.patient_id));
    if (!patient) throw new HttpError(404, 'Paciente no encontrado', 'PATIENT_NOT_FOUND');

    const created = await this.repo.add(entity);
    if (!created) throw new HttpError(500, 'No se pudo crear la consulta');

    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
}



 async updateConsultation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const entity = Consultation.create(req.body);

    const existing = await this.repo.findOne(id);
    if (!existing) throw new HttpError(404, 'Consulta no encontrada', 'CONSULTATION_NOT_FOUND');

    const updated = await this.repo.update(id, entity);
    if (!updated) throw new HttpError(404, 'Consulta no encontrada o no actualizada', 'CONSULTATION_NOT_UPDATED');

    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
}



  async partialUpdateConsultation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await this.repo.findOne(id);
    if (!existing) throw new HttpError(404, 'Consulta no encontrada', 'CONSULTATION_NOT_FOUND');

    
    if (req.body?.consultation_at) {
      const d = new Date(req.body.consultation_at);
      if (Number.isNaN(d.getTime())) throw new HttpError(400, 'Fecha/hora inválida', 'INVALID_CONSULTATION_DATE');
      req.body.consultation_at = d.toISOString();
    }

    const updated = await this.repo.partialUpdate(id, req.body);
    if (!updated) throw new HttpError(404, 'Consulta no encontrada o no actualizada', 'CONSULTATION_NOT_UPDATED');

    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
}


  async deleteConsultation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await this.repo.findOne(id);
    if (!existing) throw new HttpError(404, 'Consulta no encontrada', 'CONSULTATION_NOT_FOUND');

    const ok = await this.repo.delete(id);
    if (!ok) throw new HttpError(404, 'Consulta no encontrada', 'CONSULTATION_NOT_DELETED');

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}


  async softDeleteConsultation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await this.repo.findOne(id);
    if (!existing) throw new HttpError(404, 'Consulta no encontrada', 'CONSULTATION_NOT_FOUND');

    const deleted = await this.repo.softDelete(id);
    if (!deleted) throw new HttpError(404, 'Consulta no encontrada o no eliminada', 'CONSULTATION_NOT_DELETED');

    return res.status(200).json(deleted);
  } catch (err) {
    return next(err);
  }
}


  async restoreConsultation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const restored = await this.repo.restore(id);
    if (!restored) throw new HttpError(404, 'Consulta no encontrada o no restaurada', 'CONSULTATION_NOT_RESTORED');

    return res.status(200).json(restored);
  } catch (err) {
    return next(err);
  }
}
}

export default ConsultationController;
