export class Consultation {
  constructor(
    public patient_id: number,
    public medical_record?: string,
    public image?: string | null,
    public id?: number,
    public created_at?: string,
    public updated_at?: string,
    public deleted_at?: string | null
  ) {}

  static create(data: any) {
    const patient_id = Number(data?.patient_id);
    if (!Number.isFinite(patient_id) || patient_id <= 0) throw new Error('INVALID_PATIENT_ID');

    const medical_record =
      data?.medical_record === undefined || data?.medical_record === null
        ? undefined
        : String(data.medical_record);

    const image =
      data?.image === undefined || data?.image === null
        ? null
        : String(data.image);

    return new Consultation(
      patient_id,
      medical_record,
      image,
      data?.id !== undefined ? Number(data.id) : undefined,
      data?.created_at ? String(data.created_at) : undefined,
      data?.updated_at ? String(data.updated_at) : undefined,
      data?.deleted_at === undefined ? undefined : data.deleted_at
    );
  }
}

export default Consultation;
