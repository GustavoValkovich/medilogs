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
    };

    controller = new PatientController(repo);

    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('findAllPatients devuelve 200 y array', async () => {
    repo.findAll.mockResolvedValue([{ id: 1, name: 'Juan' }]);

    await controller.findAllPatients(req, res);

    expect(repo.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 1 })])
    );
  });

  it('findPatientById devuelve 404 si no existe', async () => {
    req.params.id = '99';
    repo.findOne.mockResolvedValue(undefined);

    await controller.findPatientById(req, res);

    expect(repo.findOne).toHaveBeenCalledWith('99');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Paciente no encontrado' });
  });

  it('findPatientById devuelve 200 y el paciente si existe', async () => {
    req.params.id = '1';
    repo.findOne.mockResolvedValue({ id: 1, name: 'Ana' });

    await controller.findPatientById(req, res);

    expect(repo.findOne).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('addPatient crea y devuelve 201', async () => {
    const nuevo = { name: 'Juan' };
    req.body = nuevo;
    const creado = { id: 3, name: 'Juan' };
    repo.add.mockResolvedValue(creado);

    await controller.addPatient(req, res);

    expect(repo.add).toHaveBeenCalledWith(nuevo);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(creado);
  });
});
