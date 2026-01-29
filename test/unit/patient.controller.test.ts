jest.mock('../../src/role/patient/patient.entity.js', () => ({
  Patient: {
    create: (data: any) => data,
  },
}));

import { PatientController } from '../../src/role/patient/patient.controller.js';

describe('PatientController', () => {
  let controller: PatientController;
  let req: any;
  let res: any;
  let repo: any;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      partialUpdate: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    };

    controller = new PatientController(repo);

    req = { params: {}, body: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('addPatient crea y devuelve 201', async () => {
    const nuevo = { full_name: 'Juan' };
    req.body = nuevo;

    const creado = { id: 3, full_name: 'Juan' };
    (repo.add as jest.Mock).mockResolvedValue(creado);

    await controller.addPatient(req, res);

    expect(repo.add).toHaveBeenCalledTimes(1);

    const arg = (repo.add as jest.Mock).mock.calls[0][0];
    expect(arg.full_name).toBe('Juan');

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(creado);
  });

   it('addPatient si falla repo.add llama next(err)', async () => {
    const next = jest.fn();

    req.body = { full_name: 'Juan' };

    (repo.add as jest.Mock).mockRejectedValue(new Error('boom'));

    await controller.addPatient(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});
