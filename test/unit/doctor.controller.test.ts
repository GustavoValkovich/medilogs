import { DoctorController } from '../../src/role/doctor/doctor.controller.js';

describe('DoctorController', () => {
  let controller: DoctorController;
  let req: any;
  let res: any;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      partialUpdate: jest.fn(),
      delete: jest.fn(),
    };

    controller = new DoctorController(mockRepository);

    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('findAllDoctors debe devolver todos los doctores', async () => {
    mockRepository.findAll.mockResolvedValue([
      { id: 1, first_name: 'Laura' },
      { id: 2, first_name: 'Pedro' },
    ]);

    await controller.findAllDoctors(req, res);

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ])
    );
  });

  it('findDoctorById debe devolver 404 si no se encuentra', async () => {
    req.params.id = '99';
    mockRepository.findOne.mockResolvedValue(undefined);

    await controller.findDoctorById(req, res);

    expect(mockRepository.findOne).toHaveBeenCalledWith('99');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Doctor no encontrado',
    });
  });

  it('findDoctorById debe devolver el doctor si existe', async () => {
    req.params.id = '1';
    mockRepository.findOne.mockResolvedValue({
      id: 1,
      first_name: 'Laura',
    });

    await controller.findDoctorById(req, res);

    expect(mockRepository.findOne).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('addDoctor debe crear un doctor nuevo', async () => {
    const newDoctor = { first_name: 'Ana' };
    req.body = newDoctor;
    const createdDoctor = { id: 3, first_name: 'Ana' };
    mockRepository.add.mockResolvedValue(createdDoctor);

    await controller.addDoctor(req, res);

    expect(mockRepository.add).toHaveBeenCalledWith(newDoctor);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdDoctor);
  });
});

