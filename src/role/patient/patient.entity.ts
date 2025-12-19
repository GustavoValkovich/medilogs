export class Patient {
  constructor(
    public full_name: string,
    public doctor_id?: number,
    public document?: string,
    public birth_date?: Date,
    public notes?: string,
    public gender?: string,
    public insurance?: string,
    public email?: string,
    public city?: string,
    public id?: number,
    public created_at?: Date,
    public updated_at?: Date,
    public deleted_at?: string | null
  ) {}

  static create(data: any) {
    const full_name = String(data?.full_name ?? '').trim();
    if (full_name.length < 2) throw new Error('INVALID_FULL_NAME');

    const doctor_id = data?.doctor_id === undefined || data?.doctor_id === null ? undefined : Number(data.doctor_id);
    if (doctor_id !== undefined && Number.isNaN(doctor_id)) throw new Error('INVALID_DOCTOR_ID');

    const document = data?.document === undefined || data?.document === null ? undefined : String(data.document).trim();
    if (document !== undefined && document.length < 6) throw new Error('INVALID_DOCUMENT');

    const birth_date_raw = data?.birth_date;
    const birth_date =
      birth_date_raw === undefined || birth_date_raw === null
        ? undefined
        : birth_date_raw instanceof Date
          ? birth_date_raw
          : new Date(birth_date_raw);

    if (birth_date !== undefined && Number.isNaN(birth_date.getTime())) throw new Error('INVALID_BIRTH_DATE');
    if (birth_date !== undefined && birth_date > new Date()) throw new Error('FUTURE_BIRTH_DATE');

    const notes = data?.notes === undefined || data?.notes === null ? undefined : String(data.notes);
    const gender = data?.gender === undefined || data?.gender === null ? undefined : String(data.gender).trim();
    const insurance = data?.insurance === undefined || data?.insurance === null ? undefined : String(data.insurance).trim();
    const email = data?.email === undefined || data?.email === null ? undefined : String(data.email).trim().toLowerCase();
    const city = data?.city === undefined || data?.city === null ? undefined : String(data.city).trim();

    if (email !== undefined && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('INVALID_EMAIL');
    }

    return new Patient(
      full_name,
      doctor_id,
      document,
      birth_date,
      notes,
      gender,
      insurance,
      email,
      city,
      data?.id,
      data?.created_at ? new Date(data.created_at) : undefined,
      data?.updated_at ? new Date(data.updated_at) : undefined,
      data?.deleted_at ?? undefined
    );
  }
}
