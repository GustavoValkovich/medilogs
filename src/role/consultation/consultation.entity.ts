export class Consultation {
  constructor(
    public patient_id: number,
    public medical_record?: string,
    public image?: string | null,
    public consultation_at?: string, 
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

        const rawDate = data?.consultation_at ?? null;
let consultation_at: string | undefined = undefined;

if (rawDate) {
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) throw new Error('INVALID_CONSULTATION_DATE');

  const now = new Date();
  if (d.getTime() > now.getTime()) {
    throw new Error('CONSULTATION_DATE_IN_FUTURE');
  }

  consultation_at = d.toISOString();
}

    
    return new Consultation(
      patient_id,
      medical_record,
      image,
      consultation_at,
      data?.id !== undefined ? Number(data.id) : undefined,
      data?.created_at ? String(data.created_at) : undefined,
      data?.updated_at ? String(data.updated_at) : undefined,
      data?.deleted_at === undefined ? undefined : data.deleted_at
    );
  }
}

export default Consultation;
