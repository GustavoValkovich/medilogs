import type { Request, Response } from 'express';
import type { Doctor } from './doctor.entity.js';
import type { DoctorRepository } from './doctor.repository.interface.js';

export class DoctorController {
  private doctorRepository: DoctorRepository;

  constructor(doctorRepository: DoctorRepository) {
    this.doctorRepository = doctorRepository;
    this.findAllDoctors = this.findAllDoctors.bind(this);
    this.findDoctorById = this.findDoctorById.bind(this);
    this.addDoctor = this.addDoctor.bind(this);
    this.updateDoctor = this.updateDoctor.bind(this);
    this.partialUpdateDoctor = this.partialUpdateDoctor.bind(this);
    this.deleteDoctor = this.deleteDoctor.bind(this);
  }

  async findAllDoctors(_req: Request, res: Response) {
    const items = await this.doctorRepository.findAll();
    return res.status(200).json(items || []);
  }

  async findDoctorById(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.doctorRepository.findOne(id);
    if (!item) return res.status(404).json({ message: 'Doctor no encontrado' });
    return res.status(200).json(item);
  }

  async addDoctor(req: Request, res: Response) {
    const data = req.body as Doctor;
    const created = await this.doctorRepository.add(data);
    if (!created) return res.status(500).json({ message: 'No se pudo crear el doctor' });
    if ((created as any).password) delete (created as any).password;
    return res.status(201).json(created);
  }

  async updateDoctor(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body as Doctor;
    const updated = await this.doctorRepository.update(id, data);
    if (!updated) return res.status(404).json({ message: 'Doctor no encontrado o no actualizado' });
    if ((updated as any).password) delete (updated as any).password;
    return res.status(200).json(updated);
  }

  async partialUpdateDoctor(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body as Partial<Doctor>;
    const updated = await this.doctorRepository.partialUpdate(id, updates);
    if (!updated) return res.status(404).json({ message: 'Doctor no encontrado o no actualizado' });
    if ((updated as any).password) delete (updated as any).password;
    return res.status(200).json(updated);
  }

  async deleteDoctor(req: Request, res: Response) {
    const { id } = req.params;
    const ok = await this.doctorRepository.delete(id);
    if (!ok) return res.status(404).json({ message: 'Doctor no encontrado' });
    return res.status(204).send();
  }
}

export default DoctorController;
