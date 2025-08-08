import { Request, Response } from 'express';
import { MedicoRepository } from '../repositories/medico-db.repository';

export class MedicoController {
  private medicoRepository: MedicoRepository;

  constructor() {
    this.medicoRepository = new MedicoRepository();
  }

  // GET /api/medicos - Obtener todos los médicos
  async getAllMedicos(req: Request, res: Response): Promise<void> {
    try {
      const medicos = await this.medicoRepository.findAll();
      
      res.json({
        success: true,
        count: medicos.length,
        data: medicos
      });
    } catch (error) {
      console.error('Error obteniendo médicos:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo médicos'
      });
    }
  }

  // GET /api/medicos/:id - Obtener médico por ID
  async getMedicoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de médico inválido'
        });
        return;
      }

      const medico = await this.medicoRepository.findById(id);
      
      if (!medico) {
        res.status(404).json({
          success: false,
          error: 'Médico no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: medico
      });
    } catch (error) {
      console.error('Error obteniendo médico:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo médico'
      });
    }
  }

  // POST /api/medicos - Crear nuevo médico
  async createMedico(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, apellido, especialidad, telefono, email, matricula, password } = req.body;

      // Validaciones básicas
      if (!nombre || !apellido || !especialidad || !matricula || !password) {
        res.status(400).json({
          success: false,
          error: 'Faltan campos requeridos: nombre, apellido, especialidad, matricula, password'
        });
        return;
      }

      // Validar formato de email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            error: 'Formato de email inválido'
          });
          return;
        }

        // Verificar si el email ya existe
        const existingMedico = await this.medicoRepository.findByEmail(email);
        if (existingMedico) {
          res.status(409).json({
            success: false,
            error: 'Ya existe un médico con ese email'
          });
          return;
        }
      }

      const nuevoMedico = await this.medicoRepository.create({
        nombre,
        apellido,
        especialidad,
        telefono,
        email,
        matricula,
        password
      });

      res.status(201).json({
        success: true,
        message: 'Médico creado exitosamente',
        data: nuevoMedico
      });
    } catch (error) {
      console.error('Error creando médico:', error);
      res.status(500).json({
        success: false,
        error: 'Error creando médico'
      });
    }
  }

  // PUT /api/medicos/:id - Actualizar médico
  async updateMedico(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de médico inválido'
        });
        return;
      }

      const { nombre, email, password } = req.body;

      // Verificar que hay algo que actualizar
      if (!nombre && !email && !password) {
        res.status(400).json({
          success: false,
          error: 'No se proporcionaron campos para actualizar'
        });
        return;
      }

      // Validar email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            error: 'Formato de email inválido'
          });
          return;
        }

        // Verificar que el email no esté en uso por otro médico
        const existingMedico = await this.medicoRepository.findByEmail(email);
        if (existingMedico && existingMedico.id !== id) {
          res.status(409).json({
            success: false,
            error: 'Ya existe otro médico con ese email'
          });
          return;
        }
      }

      const updateData: any = {};
      if (nombre) updateData.nombre = nombre;
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const medicoActualizado = await this.medicoRepository.update(id, updateData);
      
      if (!medicoActualizado) {
        res.status(404).json({
          success: false,
          error: 'Médico no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Médico actualizado exitosamente',
        data: medicoActualizado
      });
    } catch (error) {
      console.error('Error actualizando médico:', error);
      res.status(500).json({
        success: false,
        error: 'Error actualizando médico'
      });
    }
  }

  // DELETE /api/medicos/:id - Eliminar médico
  async deleteMedico(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de médico inválido'
        });
        return;
      }

      const eliminado = await this.medicoRepository.delete(id);
      
      if (!eliminado) {
        res.status(404).json({
          success: false,
          error: 'Médico no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Médico eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando médico:', error);
      
      if (error instanceof Error && error.message.includes('pacientes asignados')) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error eliminando médico'
      });
    }
  }

  // POST /api/auth/login - Login básico para médicos
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email y password son requeridos'
        });
        return;
      }

      const medico = await this.medicoRepository.validatePassword(email, password);
      
      if (!medico) {
        res.status(401).json({
          success: false,
          error: 'Email o password incorrectos'
        });
        return;
      }

      // En el futuro se puede implementar JWT token
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          medico,
          // token: 'JWT_TOKEN_AQUI' // Para implementar en el futuro
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el proceso de login'
      });
    }
  }
}
