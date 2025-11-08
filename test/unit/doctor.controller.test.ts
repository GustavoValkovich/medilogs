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

  it('findAllDoctors devuelve 200 y array', async () => {
    repo.findAll.mockResolvedValue([{ id: 1, name: 'Dr. X' }]);

    await controller.findAllDoctors(req, res);

    expect(repo.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 1 })])
    );
  });

  it('findDoctorById devuelve 404 si no existe', async () => {
    req.params.id = '99';
    repo.findOne.mockResolvedValue(undefined);

    await controller.findDoctorById(req, res);

    expect(repo.findOne).toHaveBeenCalledWith('99');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Doctor no encontrado' });
  });

  it('findDoctorById devuelve 200 y el doctor si existe', async () => {
    req.params.id = '1';
    repo.findOne.mockResolvedValue({ id: 1, name: 'Dr. Y', password: 'secret' });

    await controller.findDoctorById(req, res);

    expect(repo.findOne).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('addDoctor crea y devuelve 201 sin password en la respuesta', async () => {
    const nuevo = { name: 'Dr. New', password: 'pass' };
    req.body = nuevo;
    const creado = { id: 3, name: 'Dr. New', password: 'pass' };
    repo.add.mockResolvedValue(creado);

    await controller.addDoctor(req, res);

    expect(repo.add).toHaveBeenCalledWith(nuevo);
    expect(res.status).toHaveBeenCalledWith(201);
    // el controlador elimina password antes de devolver
    expect(res.json).toHaveBeenCalledWith(expect.not.objectContaining({ password: expect.anything() }));
  });

  it('deleteDoctor devuelve 204 si se elimina', async () => {
    req.params.id = '1';
    repo.delete.mockResolvedValue(true);

    await controller.deleteDoctor(req, res);

    expect(repo.delete).toHaveBeenCalledWith('1');
    expect(res.send).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('deleteDoctor devuelve 404 si no existe', async () => {
    req.params.id = '99';
    repo.delete.mockResolvedValue(false);

    await controller.deleteDoctor(req, res);

    expect(repo.delete).toHaveBeenCalledWith('99');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Doctor no encontrado' });
  });
});
