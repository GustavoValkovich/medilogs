-- Helper: update updated_at on each UPDATE (same idea as characters)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: doctors

CREATE TABLE IF NOT EXISTS doctors (
  id              SERIAL PRIMARY KEY,
  first_name      VARCHAR(255) NOT NULL,
  last_name       VARCHAR(255) NOT NULL,
  specialty       VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  email           VARCHAR(255),
  license_number  VARCHAR(100) NOT NULL,
  password        VARCHAR(255) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: patients

CREATE TABLE IF NOT EXISTS patients (
  id           SERIAL PRIMARY KEY,
  doctor_id    INTEGER REFERENCES doctors(id),
  full_name    VARCHAR(255),
  document     VARCHAR(50),
  birth_date   DATE,
  notes        TEXT,
  gender       VARCHAR(10),
  insurance    VARCHAR(255),
  email        VARCHAR(255),
  city         VARCHAR(255),
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: consultations

CREATE TABLE IF NOT EXISTS consultations (
  id             SERIAL PRIMARY KEY,
  patient_id     INTEGER REFERENCES patients(id),
  record_date    DATE,
  medical_record TEXT,
  image          VARCHAR(500),
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
