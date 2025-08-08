-- Script para crear las tablas de PostgreSQL con la misma estructura que SQLite

-- Tabla médicos (singular como en SQLite para mantener compatibilidad)
CREATE TABLE IF NOT EXISTS medico (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    especialidad VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    matricula VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla pacientes 
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER REFERENCES medico(id),
    nombre VARCHAR(255),
    documento VARCHAR(50),
    nacimiento DATE,
    importante TEXT,
    sexo VARCHAR(10),
    obra_social VARCHAR(255),
    mail VARCHAR(255),
    localidad VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla consultas
CREATE TABLE IF NOT EXISTS consultas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id),
    fecha_historia DATE,
    historia TEXT,
    imagen VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_fecha ON consultas(fecha_historia);
CREATE INDEX IF NOT EXISTS idx_medico_email ON medico(email);
CREATE INDEX IF NOT EXISTS idx_medico_matricula ON medico(matricula);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at (sin DROP para evitar errores)
CREATE OR REPLACE TRIGGER update_pacientes_updated_at
    BEFORE UPDATE ON pacientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_consultas_updated_at
    BEFORE UPDATE ON consultas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_medico_updated_at
    BEFORE UPDATE ON medico
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
