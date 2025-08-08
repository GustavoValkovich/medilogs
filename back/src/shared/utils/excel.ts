import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { PacienteDB, ConsultaDB, MedicoDB, PacienteCompleto, ConsultaCompleta } from '../../types/database';
import { createModuleLogger } from './logger';

const logger = createModuleLogger('ExcelUtils');

export interface ExcelExportOptions {
  includeHeaders?: boolean;
  sheetName?: string;
  fileName?: string;
}

export interface ExcelImportResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Clase utilitaria para manejar operaciones de Excel
 */
export class ExcelUtils {

  /**
   * Exportar pacientes a Excel
   */
  static async exportPacientesToExcel(
    pacientes: PacienteCompleto[],
    options: ExcelExportOptions = {}
  ): Promise<Buffer> {
    const {
      includeHeaders = true,
      sheetName = 'Pacientes',
      fileName = 'pacientes.xlsx'
    } = options;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Definir las columnas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Documento', key: 'documento', width: 15 },
        { header: 'Fecha Nacimiento', key: 'nacimiento', width: 15 },
        { header: 'Sexo', key: 'sexo', width: 10 },
        { header: 'Obra Social', key: 'obra_social', width: 25 },
        { header: 'Email', key: 'mail', width: 30 },
        { header: 'Importante', key: 'importante', width: 50 },
        { header: 'Médico', key: 'medico_nombre', width: 25 },
        { header: 'Total Consultas', key: 'total_consultas', width: 15 }
      ];

      // Aplicar estilos al header
      if (includeHeaders) {
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }

      // Agregar datos
      pacientes.forEach((paciente) => {
        worksheet.addRow({
          id: paciente.id,
          nombre: paciente.nombre || '',
          documento: paciente.documento || '',
          nacimiento: paciente.nacimiento ? new Date(paciente.nacimiento) : '',
          sexo: paciente.sexo || '',
          obra_social: paciente.obra_social || '',
          mail: paciente.mail || '',
          importante: paciente.importante || '',
          medico_nombre: paciente.medico_nombre || '',
          total_consultas: paciente.total_consultas || 0
        });
      });

      // Aplicar autofit a las columnas
      worksheet.columns.forEach(column => {
        if (column.eachCell) {
          let maxLength = 0;
          column.eachCell!({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength < 10 ? 10 : maxLength + 2;
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      logger.info(`Excel de pacientes exportado exitosamente: ${pacientes.length} registros`);
      return Buffer.from(buffer);

    } catch (error) {
      logger.error('Error al exportar pacientes a Excel:', error);
      throw new Error('Error al exportar pacientes a Excel');
    }
  }

  /**
   * Exportar consultas a Excel
   */
  static async exportConsultasToExcel(
    consultas: ConsultaCompleta[],
    options: ExcelExportOptions = {}
  ): Promise<Buffer> {
    const {
      includeHeaders = true,
      sheetName = 'Consultas',
      fileName = 'consultas.xlsx'
    } = options;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Definir las columnas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Paciente ID', key: 'paciente_id', width: 15 },
        { header: 'Paciente', key: 'paciente_nombre', width: 30 },
        { header: 'Documento', key: 'paciente_documento', width: 15 },
        { header: 'Fecha Historia', key: 'fecha_historia', width: 15 },
        { header: 'Historia', key: 'historia', width: 50 },
        { header: 'Imagen', key: 'imagen', width: 30 }
      ];

      // Aplicar estilos al header
      if (includeHeaders) {
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F3FF' }
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }

      // Agregar datos
      consultas.forEach((consulta) => {
        worksheet.addRow({
          id: consulta.id,
          paciente_id: consulta.paciente_id,
          paciente_nombre: consulta.paciente_nombre || '',
          paciente_documento: consulta.paciente_documento || '',
          fecha_historia: consulta.fecha_historia ? new Date(consulta.fecha_historia) : '',
          historia: consulta.historia || '',
          imagen: consulta.imagen || ''
        });
      });

      // Aplicar autofit a las columnas
      worksheet.columns.forEach(column => {
        if (column.eachCell) {
          let maxLength = 0;
          column.eachCell!({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength < 10 ? 10 : maxLength + 2;
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      logger.info(`Excel de consultas exportado exitosamente: ${consultas.length} registros`);
      return Buffer.from(buffer);

    } catch (error) {
      logger.error('Error al exportar consultas a Excel:', error);
      throw new Error('Error al exportar consultas a Excel');
    }
  }

  /**
   * Importar pacientes desde Excel
   */
  static async importPacientesFromExcel(
    buffer: Buffer
  ): Promise<ExcelImportResult<Partial<PacienteDB>>> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const data: Partial<PacienteDB>[] = [];
      const errors: string[] = [];
      let validRows = 0;

      // Verificar si hay datos
      if (jsonData.length < 2) {
        errors.push('El archivo Excel debe contener al menos una fila de datos además del header');
        return { data, errors, totalRows: 0, validRows: 0 };
      }

      // Obtener headers (primera fila)
      const headers = jsonData[0] as string[];
      const headerMap = this.createHeaderMap(headers, 'pacientes');

      // Procesar cada fila de datos (omitir header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        try {
          const paciente: Partial<PacienteDB> = {};

          // Mapear cada campo
          if (headerMap.nombre !== -1 && row[headerMap.nombre]) {
            paciente.nombre = String(row[headerMap.nombre]).trim();
          }

          if (headerMap.documento !== -1 && row[headerMap.documento]) {
            paciente.documento = String(row[headerMap.documento]).trim();
          }

          if (headerMap.nacimiento !== -1 && row[headerMap.nacimiento]) {
            const fecha = this.parseExcelDate(row[headerMap.nacimiento]);
            if (fecha) {
              paciente.nacimiento = fecha;
            }
          }

          if (headerMap.sexo !== -1 && row[headerMap.sexo]) {
            const sexo = String(row[headerMap.sexo]).trim().toUpperCase();
            if (['M', 'F', 'O'].includes(sexo)) {
              paciente.sexo = sexo;
            }
          }

          if (headerMap.obra_social !== -1 && row[headerMap.obra_social]) {
            paciente.obra_social = String(row[headerMap.obra_social]).trim();
          }

          if (headerMap.mail !== -1 && row[headerMap.mail]) {
            paciente.mail = String(row[headerMap.mail]).trim();
          }

          if (headerMap.importante !== -1 && row[headerMap.importante]) {
            paciente.importante = String(row[headerMap.importante]).trim();
          }

          // Validación básica
          if (!paciente.nombre || !paciente.documento) {
            errors.push(`Fila ${i + 1}: Nombre y documento son obligatorios`);
            continue;
          }

          data.push(paciente);
          validRows++;

        } catch (error) {
          errors.push(`Fila ${i + 1}: Error al procesar - ${error}`);
        }
      }

      logger.info(`Importación de pacientes completada: ${validRows} válidos de ${jsonData.length - 1} total`);
      return {
        data,
        errors,
        totalRows: jsonData.length - 1,
        validRows
      };

    } catch (error) {
      logger.error('Error al importar pacientes desde Excel:', error);
      throw new Error('Error al importar pacientes desde Excel');
    }
  }

  /**
   * Importar consultas desde Excel
   */
  static async importConsultasFromExcel(
    buffer: Buffer
  ): Promise<ExcelImportResult<Partial<ConsultaDB>>> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const data: Partial<ConsultaDB>[] = [];
      const errors: string[] = [];
      let validRows = 0;

      // Verificar si hay datos
      if (jsonData.length < 2) {
        errors.push('El archivo Excel debe contener al menos una fila de datos además del header');
        return { data, errors, totalRows: 0, validRows: 0 };
      }

      // Obtener headers (primera fila)
      const headers = jsonData[0] as string[];
      const headerMap = this.createHeaderMap(headers, 'consultas');

      // Procesar cada fila de datos (omitir header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        try {
          const consulta: Partial<ConsultaDB> = {};

          // Mapear cada campo
          if (headerMap.paciente_id !== -1 && row[headerMap.paciente_id]) {
            const pacienteId = Number(row[headerMap.paciente_id]);
            if (!isNaN(pacienteId)) {
              consulta.paciente_id = pacienteId;
            }
          }

          if (headerMap.fecha_historia !== -1 && row[headerMap.fecha_historia]) {
            const fecha = this.parseExcelDate(row[headerMap.fecha_historia]);
            if (fecha) {
              consulta.fecha_historia = fecha;
            }
          }

          if (headerMap.historia !== -1 && row[headerMap.historia]) {
            consulta.historia = String(row[headerMap.historia]).trim();
          }

          if (headerMap.imagen !== -1 && row[headerMap.imagen]) {
            consulta.imagen = String(row[headerMap.imagen]).trim();
          }

          // Validación básica
          if (!consulta.paciente_id || !consulta.historia) {
            errors.push(`Fila ${i + 1}: Paciente ID e Historia son obligatorios`);
            continue;
          }

          data.push(consulta);
          validRows++;

        } catch (error) {
          errors.push(`Fila ${i + 1}: Error al procesar - ${error}`);
        }
      }

      logger.info(`Importación de consultas completada: ${validRows} válidos de ${jsonData.length - 1} total`);
      return {
        data,
        errors,
        totalRows: jsonData.length - 1,
        validRows
      };

    } catch (error) {
      logger.error('Error al importar consultas desde Excel:', error);
      throw new Error('Error al importar consultas desde Excel');
    }
  }

  /**
   * Crear mapeo de headers para identificar columnas
   */
  private static createHeaderMap(headers: string[], type: 'pacientes' | 'consultas'): Record<string, number> {
    const map: Record<string, number> = {};

    if (type === 'pacientes') {
      // Mapeo para pacientes - buscar por diferentes variaciones de nombres
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().trim();
        
        if (normalizedHeader.includes('nombre')) map.nombre = index;
        if (normalizedHeader.includes('documento') || normalizedHeader.includes('dni')) map.documento = index;
        if (normalizedHeader.includes('nacimiento') || normalizedHeader.includes('fecha')) map.nacimiento = index;
        if (normalizedHeader.includes('sexo') || normalizedHeader.includes('género')) map.sexo = index;
        if (normalizedHeader.includes('obra') || normalizedHeader.includes('social')) map.obra_social = index;
        if (normalizedHeader.includes('mail') || normalizedHeader.includes('email')) map.mail = index;
        if (normalizedHeader.includes('importante') || normalizedHeader.includes('observacion')) map.importante = index;
      });
    } else if (type === 'consultas') {
      // Mapeo para consultas
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().trim();
        
        if (normalizedHeader.includes('paciente') && normalizedHeader.includes('id')) map.paciente_id = index;
        if (normalizedHeader.includes('fecha') && normalizedHeader.includes('historia')) map.fecha_historia = index;
        if (normalizedHeader.includes('historia') && !normalizedHeader.includes('fecha')) map.historia = index;
        if (normalizedHeader.includes('imagen')) map.imagen = index;
      });
    }

    // Inicializar campos no encontrados con -1
    if (type === 'pacientes') {
      ['nombre', 'documento', 'nacimiento', 'sexo', 'obra_social', 'mail', 'importante'].forEach(field => {
        if (!(field in map)) map[field] = -1;
      });
    } else {
      ['paciente_id', 'fecha_historia', 'historia', 'imagen'].forEach(field => {
        if (!(field in map)) map[field] = -1;
      });
    }

    return map;
  }

  /**
   * Parsear fecha desde Excel (maneja números seriales de Excel y strings)
   */
  private static parseExcelDate(value: any): Date | null {
    try {
      if (typeof value === 'number') {
        // Fecha serial de Excel
        return XLSX.SSF.parse_date_code(value);
      } else if (typeof value === 'string') {
        // String de fecha
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      } else if (value instanceof Date) {
        return value;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Crear template de Excel para importación de pacientes
   */
  static async createPacientesTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template Pacientes');

    // Definir las columnas del template
    worksheet.columns = [
      { header: 'Nombre*', key: 'nombre', width: 30 },
      { header: 'Documento*', key: 'documento', width: 15 },
      { header: 'Fecha Nacimiento', key: 'nacimiento', width: 15 },
      { header: 'Sexo (M/F)', key: 'sexo', width: 15 },
      { header: 'Obra Social', key: 'obra_social', width: 25 },
      { header: 'Email', key: 'mail', width: 30 },
      { header: 'Información Importante', key: 'importante', width: 50 }
    ];

    // Aplicar estilos al header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar fila de ejemplo
    worksheet.addRow({
      nombre: 'Juan Pérez',
      documento: '12345678',
      nacimiento: new Date('1980-05-15'),
      sexo: 'M',
      obra_social: 'OSDE',
      mail: 'juan.perez@email.com',
      importante: 'Alérgico a la penicilina'
    });

    // Agregar instrucciones
    worksheet.addRow({});
    worksheet.addRow({ nombre: 'INSTRUCCIONES:' });
    worksheet.addRow({ nombre: '• Los campos marcados con * son obligatorios' });
    worksheet.addRow({ nombre: '• Sexo: usar M (Masculino), F (Femenino)' });
    worksheet.addRow({ nombre: '• Fecha de nacimiento: formato DD/MM/YYYY' });
    worksheet.addRow({ nombre: '• Eliminar esta fila de ejemplo antes de importar' });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Crear template de Excel para importación de consultas
   */
  static async createConsultasTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template Consultas');

    // Definir las columnas del template
    worksheet.columns = [
      { header: 'Paciente ID*', key: 'paciente_id', width: 15 },
      { header: 'Fecha Historia*', key: 'fecha_historia', width: 15 },
      { header: 'Historia*', key: 'historia', width: 50 },
      { header: 'Imagen', key: 'imagen', width: 30 }
    ];

    // Aplicar estilos al header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF70AD47' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar fila de ejemplo
    worksheet.addRow({
      paciente_id: 1,
      fecha_historia: new Date(),
      historia: 'Paciente presenta dolor de cabeza recurrente...',
      imagen: 'radiografia_001.jpg'
    });

    // Agregar instrucciones
    worksheet.addRow({});
    worksheet.addRow({ paciente_id: 'INSTRUCCIONES:' });
    worksheet.addRow({ paciente_id: '• Los campos marcados con * son obligatorios' });
    worksheet.addRow({ paciente_id: '• Paciente ID debe ser un número válido existente' });
    worksheet.addRow({ paciente_id: '• Fecha Historia: formato DD/MM/YYYY' });
    worksheet.addRow({ paciente_id: '• Eliminar esta fila de ejemplo antes de importar' });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
