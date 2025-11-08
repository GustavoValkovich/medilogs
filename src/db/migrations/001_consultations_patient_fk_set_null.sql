-- Migration: change consultations.patient_id foreign key to ON DELETE SET NULL
-- Backup your DB before running.

ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_patient_id_fkey;

ALTER TABLE consultations
  ADD CONSTRAINT consultations_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES patients(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Note: patient_id column is already nullable in the current schema. If not, run:
-- ALTER TABLE consultations ALTER COLUMN patient_id DROP NOT NULL;
