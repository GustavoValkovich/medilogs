// src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";

import doctorRoutes from "./role/doctor/doctor.routes.js";
import patientRoutes from "./role/patient/patient.routes.js";
import consultationRoutes from "./role/consultation/consultation.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/consultations", consultationRoutes);

export default app;
