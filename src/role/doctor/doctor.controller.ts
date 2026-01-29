import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Doctor } from './doctor.entity.js';
import { HttpError } from '../../shared/http-error.js';

export class DoctorController {
  constructor(private repo: any) {
    this.findAllDoctors = this.findAllDoctors.bind(this);
    this.findDoctorById = this.findDoctorById.bind(this);
    this.addDoctor = this.addDoctor.bind(this);
    this.loginDoctor = this.loginDoctor.bind(this);
    this.updateDoctor = this.updateDoctor.bind(this);
    this.partialUpdateDoctor = this.partialUpdateDoctor.bind(this);
    this.deleteDoctor = this.deleteDoctor.bind(this);
  }

  async findAllDoctors(req: Request, res: Response) {
    const items = await this.repo.findAll();
    const safe = (items ?? []).map((d: any) => {
      const x = { ...d };
      if (x.password) delete x.password;
      return x;
    });
    return res.status(200).json(safe);
  }

  async findDoctorById(req: Request, res: Response, next: NextFunction = () => undefined) {
  try {
    const { id } = req.params;
    const found = await this.repo.findOne(id);

    if (!found) {
      throw new HttpError(404, 'Doctor no encontrado', 'DOCTOR_NOT_FOUND');
    }

    const safe = { ...(found as any) };
    if (safe.password) delete safe.password;

    return res.status(200).json(safe);
  } catch (err) {
    return next(err);
  }
}


  async addDoctor(req: Request, res: Response, next: NextFunction = () => undefined) {
    try {
    const data = Doctor.create(req.body);

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    const created = await this.repo.add(data);
    if (!created) throw new HttpError(500, 'Error interno al crear doctor');

    const safe = { ...(created as any) };
    if (safe.password) delete safe.password;

    return res.status(201).json(safe);
  } catch (err) {
    return next(err);
  }
}


async loginDoctor(req: Request, res: Response, next: NextFunction = () => undefined) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new HttpError(400, 'Email y password requeridos', 'MISSING_CREDENTIALS');
    }

    const all = await this.repo.findAll();
    const user = (all || []).find((d: any) => d?.email === email);
    if (!user) {
      throw new HttpError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const hashed = (user as any).password;
    const match = hashed ? await bcrypt.compare(password, hashed) : false;
    if (!match) {
      throw new HttpError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const result = { ...(user as any) };
    if (result.password) delete result.password;

    return res.status(200).json({ user: result });
  } catch (err) {
    return next(err);
  }
}

  async updateDoctor(req: Request, res: Response, next: NextFunction = () => undefined) {
  try {
    const { id } = req.params;
    const data = Doctor.create(req.body);

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    const updated = await this.repo.update(id, data);
    if (!updated) {
      throw new HttpError(404, 'Doctor no encontrado', 'DOCTOR_NOT_FOUND');
    }

    const safe = { ...(updated as any) };
    if (safe.password) delete safe.password;

    return res.status(200).json(safe);
  } catch (err) {
    return next(err);
  }
}

  async partialUpdateDoctor(req: Request, res: Response, next: NextFunction = () => undefined) {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<Doctor>;

    const allowed = ['first_name', 'last_name', 'specialty', 'phone', 'email', 'license_number', 'password'];
    const keys = Object.keys(updates).filter((k) => allowed.includes(k));

    if (keys.length === 0) {
      throw new HttpError(400, 'No hay campos actualizables', 'NO_UPDATABLE_FIELDS');
    }

    if ((updates as any).password) {
      const salt = await bcrypt.genSalt(10);
      (updates as any).password = await bcrypt.hash((updates as any).password, salt);
    }

    const filtered: Partial<Doctor> = {};
    keys.forEach((k) => ((filtered as any)[k] = (updates as any)[k]));

    const updated = await this.repo.partialUpdate(id, filtered);
    if (!updated) {
      throw new HttpError(404, 'Doctor no encontrado', 'DOCTOR_NOT_FOUND');
    }

    const safe = { ...(updated as any) };
    if (safe.password) delete safe.password;

    return res.status(200).json(safe);
  } catch (err) {
    return next(err); // ✅ duplicados/invalid_* los traduce el middleware global
  }
}

  async deleteDoctor(req: Request, res: Response, next: NextFunction = () => undefined) {
  try {
    const { id } = req.params;
    const deleted = await this.repo.delete(id);

    if (!deleted) {
      throw new HttpError(404, 'Doctor no encontrado', 'DOCTOR_NOT_FOUND');
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
}

export default DoctorController;
