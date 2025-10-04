// src/app.ts
import express, { Request, Response } from "express";
// Tenemos que agregar las rutas cuando las tengamos
// import { router as patientRouter } from "./patient/patient.routes.js";
// import { router as doctorRouter } from "./doctor/doctor.routes.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, name: "medilogs-api" });
});

export default app;