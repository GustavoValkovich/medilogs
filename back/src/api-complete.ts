import express from 'express';
import cors from 'cors';
import { 
  Paciente, 
  ConsultaMedica, 
  CreatePacienteRequest, 
  CreateConsultaRequest,
  ApiResponse,
  TipoDocumento,
  Sexo,
  EstadoConsulta 
} from './types';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base de datos en memoria
let pacientes: Paciente[] = [];
let consultas: ConsultaMedica[] = [];
let nextPacienteId = 1;
let nextConsultaId = 1;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'medilogs2-api'
  });
});

// Info de la API
app.get('/api', (req, res) => {
  res.json({
    message: 'MediLogs2 API - Sistema de Gestión Médica',
    version: '1.0.0',
    totalPacientes: pacientes.length,
    totalConsultas: consultas.length,
    endpoints: {
      pacientes: '/api/pacientes',
      consultas: '/api/consultas'
    }
  });
});

// ==================== PACIENTES ====================

// GET todos los pacientes
app.get('/api/pacientes', (req, res) => {
  const response: ApiResponse<Paciente[]> = {
    success: true,
    data: pacientes.filter(p => p.activo)
  };
  res.json(response);
});

// GET paciente por ID
app.get('/api/pacientes/:id', (req, res) => {
  const paciente = pacientes.find(p => p.id === req.params.id && p.activo);
  
  if (!paciente) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Paciente no encontrado'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Paciente> = {
    success: true,
    data: paciente
  };
  res.json(response);
});

// POST crear paciente
app.post('/api/pacientes', (req, res) => {
  const data: CreatePacienteRequest = req.body;

  // Validación básica
  if (!data.nombre || !data.apellido || !data.numeroDocumento) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Nombre, apellido y número de documento son requeridos'
    };
    res.status(400).json(response);
    return;
  }

  // Verificar duplicado
  const existente = pacientes.find(p => p.numeroDocumento === data.numeroDocumento && p.activo);
  if (existente) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Ya existe un paciente con ese número de documento'
    };
    res.status(409).json(response);
    return;
  }

  const nuevoPaciente: Paciente = {
    id: nextPacienteId.toString(),
    ...data,
    fechaNacimiento: new Date(data.fechaNacimiento),
    fechaRegistro: new Date(),
    activo: true
  };

  pacientes.push(nuevoPaciente);
  nextPacienteId++;

  const response: ApiResponse<Paciente> = {
    success: true,
    data: nuevoPaciente,
    message: 'Paciente creado exitosamente'
  };

  res.status(201).json(response);
});

// PUT actualizar paciente
app.put('/api/pacientes/:id', (req, res) => {
  const index = pacientes.findIndex(p => p.id === req.params.id && p.activo);
  
  if (index === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Paciente no encontrado'
    };
    res.status(404).json(response);
    return;
  }

  pacientes[index] = { ...pacientes[index], ...req.body };

  const response: ApiResponse<Paciente> = {
    success: true,
    data: pacientes[index],
    message: 'Paciente actualizado exitosamente'
  };

  res.json(response);
});

// DELETE paciente
app.delete('/api/pacientes/:id', (req, res) => {
  const index = pacientes.findIndex(p => p.id === req.params.id && p.activo);
  
  if (index === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Paciente no encontrado'
    };
    res.status(404).json(response);
    return;
  }

  pacientes[index].activo = false;

  const response: ApiResponse<null> = {
    success: true,
    message: 'Paciente eliminado exitosamente'
  };

  res.json(response);
});

// ==================== CONSULTAS ====================

// GET todas las consultas
app.get('/api/consultas', (req, res) => {
  const response: ApiResponse<ConsultaMedica[]> = {
    success: true,
    data: consultas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  };
  res.json(response);
});

// GET consulta por ID
app.get('/api/consultas/:id', (req, res) => {
  const consulta = consultas.find(c => c.id === req.params.id);
  
  if (!consulta) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Consulta no encontrada'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<ConsultaMedica> = {
    success: true,
    data: consulta
  };
  res.json(response);
});

// GET consultas por paciente  
app.get('/api/pacientes/:pacienteId/consultas', (req, res) => {
  const consultasPaciente = consultas.filter(c => c.pacienteId === req.params.pacienteId);

  const response: ApiResponse<ConsultaMedica[]> = {
    success: true,
    data: consultasPaciente.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  };
  res.json(response);
});

// POST crear consulta
app.post('/api/consultas', (req, res) => {
  const data: CreateConsultaRequest = req.body;

  // Validación básica
  if (!data.pacienteId || !data.fecha || !data.motivo || !data.medico) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'PacienteId, fecha, motivo y médico son requeridos'
    };
    res.status(400).json(response);
    return;
  }

  // Verificar que existe el paciente
  const pacienteExiste = pacientes.find(p => p.id === data.pacienteId && p.activo);
  if (!pacienteExiste) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'El paciente especificado no existe'
    };
    res.status(400).json(response);
    return;
  }

  const nuevaConsulta: ConsultaMedica = {
    id: nextConsultaId.toString(),
    ...data,
    fecha: new Date(data.fecha),
    sintomas: data.sintomas || [],
    signosVitales: data.signosVitales || {},
    estado: EstadoConsulta.PROGRAMADA
  };

  consultas.push(nuevaConsulta);
  nextConsultaId++;

  const response: ApiResponse<ConsultaMedica> = {
    success: true,
    data: nuevaConsulta,
    message: 'Consulta creada exitosamente'
  };

  res.status(201).json(response);
});

// PUT actualizar consulta
app.put('/api/consultas/:id', (req, res) => {
  const index = consultas.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Consulta no encontrada'
    };
    res.status(404).json(response);
    return;
  }

  const updateData = { ...req.body };
  if (updateData.proximaCita) {
    updateData.proximaCita = new Date(updateData.proximaCita);
  }

  consultas[index] = { ...consultas[index], ...updateData };

  const response: ApiResponse<ConsultaMedica> = {
    success: true,
    data: consultas[index],
    message: 'Consulta actualizada exitosamente'
  };

  res.json(response);
});

// PATCH cambiar estado de consulta
app.patch('/api/consultas/:id/estado', (req, res) => {
  const index = consultas.findIndex(c => c.id === req.params.id);
  const { estado } = req.body;
  
  if (index === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Consulta no encontrada'
    };
    res.status(404).json(response);
    return;
  }

  if (!Object.values(EstadoConsulta).includes(estado)) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Estado inválido. Valores permitidos: ' + Object.values(EstadoConsulta).join(', ')
    };
    res.status(400).json(response);
    return;
  }

  consultas[index].estado = estado;

  const response: ApiResponse<ConsultaMedica> = {
    success: true,
    data: consultas[index],
    message: `Estado cambiado a ${estado}`
  };

  res.json(response);
});

// DELETE consulta
app.delete('/api/consultas/:id', (req, res) => {
  const index = consultas.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Consulta no encontrada'
    };
    res.status(404).json(response);
    return;
  }

  consultas.splice(index, 1);

  const response: ApiResponse<null> = {
    success: true,
    message: 'Consulta eliminada exitosamente'
  };

  res.json(response);
});

// Endpoint no encontrado
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🚀 MediLogs2 API corriendo en puerto ${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🏥 API Info: http://localhost:${PORT}/api`);
  console.log(`\n📖 ENDPOINTS PARA POSTMAN:`);
  console.log(`👥 PACIENTES:`);
  console.log(`   GET    http://localhost:${PORT}/api/pacientes`);
  console.log(`   POST   http://localhost:${PORT}/api/pacientes`);
  console.log(`   GET    http://localhost:${PORT}/api/pacientes/:id`);
  console.log(`   PUT    http://localhost:${PORT}/api/pacientes/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/pacientes/:id`);
  console.log(`\n📅 CONSULTAS:`);
  console.log(`   GET    http://localhost:${PORT}/api/consultas`);
  console.log(`   POST   http://localhost:${PORT}/api/consultas`);
  console.log(`   GET    http://localhost:${PORT}/api/consultas/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/pacientes/:pacienteId/consultas`);
  console.log(`   PUT    http://localhost:${PORT}/api/consultas/:id`);
  console.log(`   PATCH  http://localhost:${PORT}/api/consultas/:id/estado`);
  console.log(`   DELETE http://localhost:${PORT}/api/consultas/:id\n`);
});

export default app;
