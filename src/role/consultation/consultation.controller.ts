import type { Request, Response } from 'express';

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

  async findAllConsultations(req: Request, res: Response) {
    const items = await this.repo.findAll();
    return res.status(200).json(items || []);
  }

  async findConsultationById(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.repo.findOne(id);
    if (!item) return res.status(404).json({ message: 'Consulta no encontrada' });
    return res.status(200).json(item);
  }

  async addConsultation(req: Request, res: Response) {
    const data = req.body;
    const patientId = data?.patient_id;
    if (!patientId) return res.status(400).json({ message: 'patient_id es requerido' });

    const patient = await this.patientRepo.findOne(String(patientId));
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    const created = await this.repo.add(data);
    if (!created) return res.status(500).json({ message: 'No se pudo crear la consulta' });
    return res.status(201).json(created);
  }

  async updateConsultation(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const existing = await this.repo.findOne(id);
    if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

    const updated = await this.repo.update(id, data);
    if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
    return res.status(200).json(updated);
  }

  async partialUpdateConsultation(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;

    const existing = await this.repo.findOne(id);
    if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

    const updated = await this.repo.partialUpdate(id, updates);
    if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o no actualizada' });
    return res.status(200).json(updated);
  }

  async deleteConsultation(req: Request, res: Response) {
    const { id } = req.params;

    const existing = await this.repo.findOne(id);
    if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

    const ok = await this.repo.delete(id);
    if (!ok) return res.status(404).json({ message: 'Consulta no encontrada' });
    return res.status(204).send();
  }

  async softDeleteConsultation(req: Request, res: Response) {
    const { id } = req.params;
    const { deleted_at } = req.body || {};

    const existing = await this.repo.findOne(id);
    if (!existing) return res.status(404).json({ message: 'Consulta no encontrada' });

    const updated = await this.repo.softDelete(id, deleted_at);
    if (!updated) return res.status(404).json({ message: 'Consulta no encontrada o ya eliminada' });
    return res.status(200).json(updated);
  }

  async restoreConsultation(req: Request, res: Response) {
    const { id } = req.params;
    const restored = await this.repo.restore(id);
    if (!restored) return res.status(404).json({ message: 'Consulta no encontrada o no eliminada' });
    return res.status(200).json(restored);
  }
}

export default ConsultationController;
