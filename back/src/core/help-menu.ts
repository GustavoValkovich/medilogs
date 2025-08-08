import readline from 'readline';
import { config } from './config';
import { logger } from '../shared/utils/logger';

export class HelpMenu {
  private rl: readline.Interface;
  private port: number;
  private isMenuActive: boolean = false;

  constructor(port: number) {
    this.port = port;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Escuchar entrada del usuario
    this.rl.on('line', (input: string) => {
      const command = input.trim().toLowerCase();
      this.handleCommand(command);
    });
  }

  private handleCommand(command: string): void {
    switch (command) {
      case 'help':
      case 'h':
        this.isMenuActive = true;
        this.showMainMenu();
        this.showPrompt();
        break;
      case 'endpoints':
      case 'e':
        if (this.isMenuActive) {
          this.showEndpoints();
          this.showPrompt();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case 'examples':
      case 'ex':
        if (this.isMenuActive) {
          this.showExamples();
          this.showPrompt();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case 'medicos':
      case 'm':
        if (this.isMenuActive) {
          this.showMedicosCommands();
          this.showPrompt();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case 'excel':
        if (this.isMenuActive) {
          this.showExcelCommands();
          this.showPrompt();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case 'status':
      case 's':
        if (this.isMenuActive) {
          this.showStatus();
          this.showPrompt();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case 'urls':
      case 'u':
        if (this.isMenuActive) {
          this.showUrls();
          this.showPrompt();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case 'clear':
      case 'c':
        if (this.isMenuActive) {
          console.clear();
          this.showPrompt();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case 'exit':
      case 'quit':
      case 'q':
        if (this.isMenuActive) {
          this.exitMenu();
        } else {
          this.showNotInMenuMessage();
        }
        break;
      case '':
        // Línea vacía, solo mostrar prompt si está en menú
        if (this.isMenuActive) {
          this.showPrompt();
        }
        break;
      default:
        if (this.isMenuActive) {
          console.log(`❌ Comando no reconocido: '${command}'`);
          console.log('💡 Escribe "help" para ver comandos disponibles');
          this.showPrompt();
        } else {
          console.log(`❌ Comando no reconocido: '${command}'`);
          console.log('💡 Escribe "help" para entrar al menú de ayuda');
        }
        break;
    }
  }

  private showMainMenu(): void {
    console.log('\n📋 MENÚ DE AYUDA - MediLogs API');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📌 COMANDOS DISPONIBLES:');
    console.log('   help, h       - Mostrar este menú');
    console.log('   endpoints, e  - Mostrar todos los endpoints');
    console.log('   examples, ex  - Mostrar ejemplos de uso');
    console.log('   medicos, m    - Comandos específicos de médicos');
    console.log('   excel         - Comandos específicos de Excel');
    console.log('   status, s     - Estado del servidor');
    console.log('   urls, u       - URLs principales');
    console.log('   clear, c      - Limpiar pantalla');
    console.log('   exit, quit, q - Salir del menú');
    console.log('');
    console.log('💡 Escribe cualquier comando y presiona Enter');
    console.log('════════════════════════════════════════════════════════════════');
  }

  private showEndpoints(): void {
    console.log('\n📡 ENDPOINTS COMPLETOS - MediLogs API');
    console.log('════════════════════════════════════════════════════════════════');
    
    // 🔐 AUTENTICACIÓN
    console.log('\n🔐 AUTENTICACIÓN:');
    console.log(`   POST   ${config.apiPrefix}/auth/login`);
    console.log(`   POST   ${config.apiPrefix}/auth/logout`);
    console.log(`   GET    ${config.apiPrefix}/auth/profile`);
    
    // 👥 PACIENTES
    console.log('\n👥 PACIENTES:');
    console.log(`   GET    ${config.apiPrefix}/patients           # Listar pacientes`);
    console.log(`   POST   ${config.apiPrefix}/patients           # Crear paciente`);
    console.log(`   GET    ${config.apiPrefix}/patients/:id       # Obtener paciente`);
    console.log(`   PUT    ${config.apiPrefix}/patients/:id       # Actualizar paciente`);
    console.log(`   DELETE ${config.apiPrefix}/patients/:id       # Eliminar paciente`);
    console.log(`   GET    ${config.apiPrefix}/patients/search    # Buscar pacientes`);
    
    // 👨‍⚕️ MÉDICOS
    console.log('\n👨‍⚕️ MÉDICOS:');
    console.log(`   GET    ${config.apiPrefix}/doctors            # Listar médicos`);
    console.log(`   POST   ${config.apiPrefix}/doctors            # Crear médico`);
    console.log(`   GET    ${config.apiPrefix}/doctors/:id        # Obtener médico`);
    console.log(`   PUT    ${config.apiPrefix}/doctors/:id        # Actualizar médico`);
    console.log(`   DELETE ${config.apiPrefix}/doctors/:id        # Eliminar médico`);
    console.log(`   GET    ${config.apiPrefix}/doctors/search     # Buscar médicos`);
    
    // 📅 CONSULTAS
    console.log('\n📅 CONSULTAS:');
    console.log(`   GET    ${config.apiPrefix}/consultations                    # Listar consultas`);
    console.log(`   POST   ${config.apiPrefix}/consultations                    # Crear consulta`);
    console.log(`   POST   ${config.apiPrefix}/consultations/with-files        # Crear con archivos`);
    console.log(`   GET    ${config.apiPrefix}/consultations/:id               # Obtener consulta`);
    console.log(`   PUT    ${config.apiPrefix}/consultations/:id               # Actualizar consulta`);
    console.log(`   DELETE ${config.apiPrefix}/consultations/:id               # Eliminar consulta`);
    console.log(`   GET    ${config.apiPrefix}/consultations/recent            # Consultas recientes`);
    console.log(`   GET    ${config.apiPrefix}/consultations/search            # Buscar consultas`);
    console.log(`   GET    ${config.apiPrefix}/consultations/with-images       # Con imágenes`);
    console.log(`   GET    ${config.apiPrefix}/consultations/by-patient/:id    # Por paciente`);
    console.log(`   GET    ${config.apiPrefix}/consultations/:id/image         # Info de imagen`);
    console.log(`   GET    ${config.apiPrefix}/consultations/patient/:id/images # Imágenes de paciente`);
    
    // 📁 ARCHIVOS
    console.log('\n📁 ARCHIVOS:');
    console.log(`   POST   ${config.apiPrefix}/files/upload       # Subir archivo`);
    console.log(`   GET    ${config.apiPrefix}/files/:filename    # Obtener archivo`);
    console.log(`   DELETE ${config.apiPrefix}/files/:filename    # Eliminar archivo`);
    console.log(`   GET    /uploads/:filename                     # Acceso directo a archivos`);
    
    // 📊 EXCEL
    console.log('\n📊 EXCEL - EXPORTACIÓN:');
    console.log(`   GET    ${config.apiPrefix}/excel/export/pacientes/all      # Exportar todos los pacientes`);
    console.log(`   POST   ${config.apiPrefix}/excel/export/pacientes/selected # Exportar pacientes seleccionados`);
    console.log(`   GET    ${config.apiPrefix}/excel/export/consultas/all      # Exportar todas las consultas`);
    console.log(`   GET    ${config.apiPrefix}/excel/export/consultas/paciente/:id # Consultas de paciente`);
    
    console.log('\n📊 EXCEL - IMPORTACIÓN:');
    console.log(`   POST   ${config.apiPrefix}/excel/import/pacientes          # Importar pacientes`);
    console.log(`   POST   ${config.apiPrefix}/excel/import/consultas          # Importar consultas`);
    console.log(`   POST   ${config.apiPrefix}/excel/validate?type=pacientes   # Validar archivo`);
    
    console.log('\n📊 EXCEL - TEMPLATES:');
    console.log(`   GET    ${config.apiPrefix}/excel/template/pacientes        # Template pacientes`);
    console.log(`   GET    ${config.apiPrefix}/excel/template/consultas        # Template consultas`);
    
    // ⚡ SISTEMA
    console.log('\n⚡ SISTEMA:');
    console.log(`   GET    /health                                # Health check`);
    console.log(`   GET    ${config.apiPrefix}                   # Info de la API`);
    
    // 🔗 RUTAS LEGACY
    console.log('\n🔗 COMPATIBILIDAD (rutas legacy):');
    console.log(`   *      ${config.apiPrefix}/pacientes         # = /patients`);
    console.log(`   *      ${config.apiPrefix}/medicos           # = /doctors`);
    console.log(`   *      ${config.apiPrefix}/consultas         # = /consultations`);
    
    console.log('\n════════════════════════════════════════════════════════════════');
  }

  private showExamples(): void {
    console.log('\n💡 EJEMPLOS DE USO - MediLogs API');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🌐 OBTENER INFORMACIÓN:');
    console.log(`   curl http://localhost:${this.port}${config.apiPrefix}/patients`);
    console.log(`   curl http://localhost:${this.port}${config.apiPrefix}/consultations`);
    console.log(`   curl http://localhost:${this.port}${config.apiPrefix}/doctors`);
    console.log('');
    console.log('👤 CREAR PACIENTE:');
    console.log(`   curl -X POST http://localhost:${this.port}${config.apiPrefix}/patients \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"nombre":"Juan Pérez","documento":"12345678"}'`);
    console.log('');
    console.log('📊 EXPORTAR DATOS:');
    console.log(`   curl http://localhost:${this.port}${config.apiPrefix}/excel/export/pacientes/all -o pacientes.xlsx`);
    console.log(`   curl http://localhost:${this.port}${config.apiPrefix}/excel/export/consultas/all -o consultas.xlsx`);
    console.log('');
    console.log('📥 IMPORTAR DATOS:');
    console.log(`   curl -X POST -F "file=@pacientes.xlsx" http://localhost:${this.port}${config.apiPrefix}/excel/import/pacientes`);
    console.log(`   curl -X POST -F "file=@consultas.xlsx" http://localhost:${this.port}${config.apiPrefix}/excel/import/consultas`);
    console.log('');
    console.log('🔍 BUSCAR:');
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/patients/search?q=Juan"`);
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/consultations/search?q=dolor"`);
    console.log('');
    console.log('🏥 HEALTH CHECK:');
    console.log(`   curl http://localhost:${this.port}/health`);
    console.log('');
    console.log('════════════════════════════════════════════════════════════════');
  }

  private showMedicosCommands(): void {
    console.log('\n👨‍⚕️ COMANDOS ESPECÍFICOS DE MÉDICOS');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 LISTAR TODOS LOS MÉDICOS:');
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/doctors"`);
    console.log('');
    console.log('➕ CREAR NUEVO MÉDICO:');
    console.log(`   curl -X POST "http://localhost:${this.port}${config.apiPrefix}/doctors" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{`);
    console.log(`       "nombre": "Dr. Juan",`);
    console.log(`       "apellido": "Pérez",`);
    console.log(`       "especialidad": "Cardiología",`);
    console.log(`       "telefono": "11-1234-5678",`);
    console.log(`       "email": "juan.perez@hospital.com",`);
    console.log(`       "matricula": "MP123456",`);
    console.log(`       "password": "MiPassword123"`);
    console.log(`     }'`);
    console.log('');
    console.log('🔍 OBTENER MÉDICO POR ID:');
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/doctors/1"`);
    console.log('');
    console.log('✏️ MODIFICAR MÉDICO EXISTENTE:');
    console.log(`   curl -X PUT "http://localhost:${this.port}${config.apiPrefix}/doctors/1" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{`);
    console.log(`       "especialidad": "Neurología",`);
    console.log(`       "telefono": "11-9876-5432"`);
    console.log(`     }'`);
    console.log('');
    console.log('🗑️ ELIMINAR MÉDICO:');
    console.log(`   curl -X DELETE "http://localhost:${this.port}${config.apiPrefix}/doctors/1"`);
    console.log('');
    console.log('📋 CAMPOS REQUERIDOS PARA CREAR:');
    console.log('   ✅ nombre*       - Nombre del médico (2-100 caracteres)');
    console.log('   ✅ apellido*     - Apellido del médico (2-100 caracteres)');
    console.log('   ✅ especialidad* - Especialidad médica (2-100 caracteres)');
    console.log('   ✅ matricula*    - Número de matrícula (3-50 caracteres)');
    console.log('   ✅ password*     - Contraseña (mínimo 6 caracteres)');
    console.log('');
    console.log('📋 CAMPOS OPCIONALES:');
    console.log('   📞 telefono      - Número de teléfono (máximo 20 caracteres)');
    console.log('   📧 email         - Correo electrónico (formato email válido)');
    console.log('');
    console.log('⚠️  NOTAS IMPORTANTES:');
    console.log('   • No se puede eliminar un médico que tiene pacientes asignados');
    console.log('   • La matrícula debe ser única');
    console.log('   • El email debe ser único si se proporciona');
    console.log('   • La contraseña se encripta automáticamente');
    console.log('');
    console.log('💡 POSTMAN/INSOMNIA:');
    console.log('   URL Base: http://localhost:3000');
    console.log('   Content-Type: application/json');
    console.log('   No requiere autenticación para estas operaciones');
    console.log('');
    console.log('════════════════════════════════════════════════════════════════');
  }

  private showExcelCommands(): void {
    console.log('\n📊 COMANDOS ESPECÍFICOS DE EXCEL');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 DESCARGAR TEMPLATES:');
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/excel/template/pacientes" -o template_pacientes.xlsx`);
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/excel/template/consultas" -o template_consultas.xlsx`);
    console.log('');
    console.log('📤 IMPORTAR DATOS:');
    console.log(`   curl -X POST -F "file=@mi_archivo.xlsx" http://localhost:${this.port}${config.apiPrefix}/excel/import/pacientes`);
    console.log(`   curl -X POST -F "file=@mi_archivo.xlsx" http://localhost:${this.port}${config.apiPrefix}/excel/import/consultas`);
    console.log('');
    console.log('🔍 VALIDAR ANTES DE IMPORTAR:');
    console.log(`   curl -X POST -F "file=@mi_archivo.xlsx" "http://localhost:${this.port}${config.apiPrefix}/excel/validate?type=pacientes"`);
    console.log(`   curl -X POST -F "file=@mi_archivo.xlsx" "http://localhost:${this.port}${config.apiPrefix}/excel/validate?type=consultas"`);
    console.log('');
    console.log('📊 EXPORTAR DATOS:');
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/excel/export/pacientes/all" -o todos_pacientes.xlsx`);
    console.log(`   curl "http://localhost:${this.port}${config.apiPrefix}/excel/export/consultas/all" -o todas_consultas.xlsx`);
    console.log('');
    console.log('📋 CAMPOS SOPORTADOS:');
    console.log('   PACIENTES: Nombre*, Documento*, Fecha Nacimiento, Sexo (M/F/O), Obra Social, Email, Info Importante');
    console.log('   CONSULTAS: Paciente ID*, Fecha Historia*, Historia*, Imagen (nombre archivo)');
    console.log('');
    console.log('════════════════════════════════════════════════════════════════');
  }

  private showStatus(): void {
    console.log('\n⚡ ESTADO DEL SERVIDOR');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`📡 Servidor: MediLogs v${config.version}`);
    console.log(`🌐 Puerto: ${this.port}`);
    console.log(`🌍 Entorno: ${config.server.env}`);
    console.log(`💾 Base de datos: ${config.database.type}`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
    console.log(`🎯 Estado: ✅ Funcionando`);
    console.log('════════════════════════════════════════════════════════════════');
  }

  private showUrls(): void {
    console.log('\n🌐 URLs PRINCIPALES');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`🏥 API Info:     http://localhost:${this.port}${config.apiPrefix}`);
    console.log(`✅ Health:       http://localhost:${this.port}/health`);
    console.log(`👥 Pacientes:    http://localhost:${this.port}${config.apiPrefix}/patients`);
    console.log(`📅 Consultas:    http://localhost:${this.port}${config.apiPrefix}/consultations`);
    console.log(`👨‍⚕️ Médicos:      http://localhost:${this.port}${config.apiPrefix}/doctors`);
    console.log(`📊 Excel:        http://localhost:${this.port}${config.apiPrefix}/excel`);
    console.log(`📁 Uploads:      http://localhost:${this.port}/uploads`);
    console.log(`🔐 Login:        http://localhost:${this.port}${config.apiPrefix}/auth/login`);
    console.log('════════════════════════════════════════════════════════════════');
  }

  public showWelcomeMessage(): void {
    console.log('\n💡 AYUDA DISPONIBLE:');
    console.log('   Escribe "help" para ver el menú de comandos');
    console.log('');
  }

  public close(): void {
    this.rl.close();
  }

  private showPrompt(): void {
    console.log('\n💬 Escribe un comando (help para ver opciones):');
  }

  private showNotInMenuMessage(): void {
    console.log('💡 Escribe "help" para entrar al menú de ayuda');
  }

  private exitMenu(): void {
    this.isMenuActive = false;
    console.log('\n👋 Saliendo del menú de ayuda...');
    console.log('💡 Escribe "help" para volver a entrar al menú');
    console.log('');
  }
}
