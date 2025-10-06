import { Doctor } from "./doctor.entity.js";

export interface DoctorRepository {
    findAll(): Promise<Doctor[] | undefined>;
    findOne(id: string): Promise<Doctor | undefined>;
    add(doctor: Doctor): Promise<Doctor | undefined>;
    update(id: string, doctor: Doctor): Promise<Doctor | undefined>;
    partialUpdate(id: string, updates: Partial<Doctor>): Promise<Doctor | undefined>;
    delete(id: string): Promise<Doctor | undefined>;
}