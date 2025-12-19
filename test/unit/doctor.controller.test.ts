import { DoctorController } from '../../src/role/doctor/doctor.controller.js';

describe('DoctorController', () => {
  let controller: DoctorController;
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
    };

    controller = new DoctorController(repo);

    req = { params: {}, body: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('addDoctor crea y devuelve 201 sin password en la respuesta', async () => {
    const nuevo: any = {
      first_name: 'Dr.',
      last_name: 'New',
      specialty: 'Clinica',
      license_number: 'ABC123',
      password: 'pass1234',
    };

    req.body = nuevo;

    const creado: any = {
      id: 3,
      first_name: 'Dr.',
      last_name: 'New',
      specialty: 'Clinica',
      license_number: 'ABC123',
      password: 'hashed',
    };

    (repo.add as jest.Mock).mockResolvedValue(creado);

    await controller.addDoctor(req, res);

    expect(repo.add).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.not.objectContaining({ password: expect.anything() })
    );
  });
});
