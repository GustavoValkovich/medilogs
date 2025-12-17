export class Doctor {
  constructor(
    public first_name: string,
    public last_name: string,
    public specialty: string,
    public license_number: string,
    public password: string,
    public phone?: string,
    public email?: string,
    public created_at?: Date,
    public updated_at?: Date
  ) {}

  static create(data: any) {
    const first_name = String(data?.first_name ?? '').trim();
    if (first_name.length < 2) throw new Error('INVALID_FIRST_NAME');

    const last_name = String(data?.last_name ?? '').trim();
    if (last_name.length < 2) throw new Error('INVALID_LAST_NAME');

    const specialty = String(data?.specialty ?? '').trim();
    if (specialty.length < 2) throw new Error('INVALID_SPECIALTY');

    const license_number = String(data?.license_number ?? '').trim();
    if (license_number.length < 3) throw new Error('INVALID_LICENSE_NUMBER');

    const password = String(data?.password ?? '');
    if (password.length < 8) throw new Error('INVALID_PASSWORD');

    const phone =
      data?.phone === undefined || data?.phone === null
        ? undefined
        : String(data.phone).trim();

    const email =
      data?.email === undefined || data?.email === null
        ? undefined
        : String(data.email).trim().toLowerCase();

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('INVALID_EMAIL');
    }

    return new Doctor(
      first_name,
      last_name,
      specialty,
      license_number,
      password,
      phone,
      email,
      data?.created_at ? new Date(data.created_at) : undefined,
      data?.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}
