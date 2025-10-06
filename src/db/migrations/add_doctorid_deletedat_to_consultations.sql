-- Migration: 2025-10-06 - Añadir doctor_id y deleted_at a consultations
-- Uso: ejecutar en la base de datos PostgreSQL del proyecto.
-- Pasos seguros: se ejecuta dentro de una transacción.

BEGIN;

-- 1) Añadir columna doctor_id (nullable inicialmente)
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS doctor_id INTEGER;

-- 2) Añadir columna deleted_at para soft-delete
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3) Backfill: si la consulta tiene patient_id y el paciente tiene doctor_id, copiarlo
UPDATE consultations c
SET doctor_id = p.doctor_id
FROM patients p
WHERE c.patient_id = p.id AND c.doctor_id IS NULL;

-- 4) Establecer doctor_id NOT NULL si tu política lo permite (opcional)
-- Si no quieres forzar NOT NULL ahora, omite el siguiente bloque.
-- ALTER TABLE consultations ALTER COLUMN doctor_id SET NOT NULL;

-- 5) Agregar FK (opcional si quieres proteger integridad). Si hay consultas sin doctor_id, la FK fallará.
ALTER TABLE consultations
  ADD CONSTRAINT fk_consultations_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL;

-- 6) Crear índice en deleted_at para acelerar queries WHERE deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_consultations_deleted_at ON consultations (deleted_at);

COMMIT;

-- Rollback: si algo falla, puedes revertir manualmente con:
-- BEGIN; ALTER TABLE consultations DROP CONSTRAINT IF EXISTS fk_consultations_doctor; ALTER TABLE consultations DROP COLUMN IF EXISTS doctor_id; ALTER TABLE consultations DROP COLUMN IF EXISTS deleted_at; DROP INDEX IF EXISTS idx_consultations_deleted_at; COMMIT;
