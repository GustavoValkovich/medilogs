# MediLogs - Sistema de Gestión Médica

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/GustavoValkovich/medilogs)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

MediLogs es un sistema web moderno y profesional para la gestión integral de pacientes, consultas médicas y archivos clínicos. Desarrollado con arquitectura modular, seguridad avanzada y una interfaz intuitiva que optimiza el flujo de trabajo médico.

**Creado por:** Gustavo Valkovich y Emiliano Druetta

## Características Principales

### Seguridad Avanzada
- Autenticación JWT con tokens seguros
- Encriptación de contraseñas con bcrypt
- Validación de datos y sanitización automática
- Headers de seguridad con Helmet
- Rate limiting por IP

### Gestión de Pacientes
- CRUD completo con validaciones robustas
- Búsqueda avanzada por múltiples criterios
- Historial médico completo y trazable
- Gestión segura de datos sensibles
- Integración con obra social y localidad

### Sistema de Consultas
- Calendario integrado con vista diaria
- Registro detallado de consultas médicas
- Historial cronológico de pacientes
- Estados de consulta (programada, completada, cancelada)
- Asociación de archivos médicos

### Manejo de Archivos
- Upload seguro de imágenes (JPG, PNG) y documentos (PDF)
- Validación de tipos MIME automática
- Límite de tamaño configurable
- Almacenamiento local con nomenclatura única
- Organización por paciente y consulta

### Interfaz Moderna
- Diseño responsive con Bootstrap 5
- Modo oscuro/claro
- Sidebar navegable
- Componentes interactivos y accesibles

## Instalación

### Prerrequisitos
- Node.js v18.0.0 o superior
- npm v8.0.0 o superior
- PostgreSQL v16.0 o superior

### Configuración del Backend

```bash
# Clonar el repositorio
git clone https://github.com/GustavoValkovich/medilogs.git
cd medilogs

# Instalar dependencias del backend
cd back
npm install

# Compilar TypeScript
npm run build

# Iniciar servidor en modo desarrollo
npm run dev
```

### Configuración de Base de Datos

```sql
-- Crear base de datos PostgreSQL
CREATE DATABASE medilogs;
CREATE USER medilogs WITH PASSWORD 'Medilogs335!';
GRANT ALL PRIVILEGES ON DATABASE medilogs TO medilogs;

-- Ejecutar scripts de inicialización
\i scripts/create-postgres-tables.sql
```

### Variables de Entorno

Crear archivo `.env` en el directorio `/back`:

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medilogs
DB_USER=medilogs
DB_PASSWORD=Medilogs335!

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_MAX_SIZE=1048576
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
```

### Configuración Inicial

```bash
# Crear doctor inicial
npm run setup:doctor

# Acceder al sistema
# Usuario: DianaPacientes
# Contraseña: 123456
```

## Arquitectura del Sistema

### Estructura del Proyecto

```
medilogs/
├── UI/                              # Frontend (Cliente Web)
│   ├── index.html                   # Dashboard principal
│   ├── login.html                   # Página de autenticación
│   ├── agregar-paciente.html        # Gestión de pacientes
│   ├── editar-paciente.html         # Edición de pacientes
│   ├── historial.html               # Historial médico
│   ├── script.js                    # Lógica principal del dashboard
│   ├── config.js                    # Configuración del frontend
│   ├── styles.css                   # Estilos principales
│   └── assets/                      # Recursos estáticos
│       ├── css/                     # Estilos modulares
│       ├── img/                     # Imágenes del sistema
│       └── js/                      # JavaScript del cliente
│           ├── api.js               # Cliente API REST
│           ├── login.js             # Lógica de autenticación
│           └── historial.js         # Gestión de historial
├── back/                            # Backend (Servidor API)
│   ├── src/                         # Código fuente TypeScript
│   │   ├── modules/                 # Módulos por dominio
│   │   │   ├── auth/                # Autenticación y autorización
│   │   │   ├── patients/            # Gestión de pacientes
│   │   │   ├── doctors/             # Gestión de médicos
│   │   │   ├── consultations/       # Consultas médicas
│   │   │   ├── files/               # Manejo de archivos
│   │   │   └── medicos/             # Módulo legacy de médicos
│   │   ├── config/                  # Configuración de base de datos
│   │   ├── core/                    # Núcleo de la aplicación
│   │   ├── controllers/             # Controladores legacy
│   │   ├── repositories/            # Repositorios de datos
│   │   ├── services/                # Servicios de negocio
│   │   ├── shared/                  # Utilidades compartidas
│   │   │   ├── middleware/          # Middleware personalizado
│   │   │   └── utils/               # Utilidades comunes
│   │   └── types/                   # Definiciones de tipos TypeScript
│   ├── scripts/                     # Scripts de base de datos
│   ├── uploads/                     # Archivos subidos
│   └── package.json                 # Dependencias del backend
├── docker-compose.yml               # Configuración Docker
├── README_DOCKER.md                 # Documentación Docker
└── README.md                        # Documentación principal
```

### Stack Tecnológico

#### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos con Bootstrap 5
- **JavaScript ES6+** - Lógica del cliente
- **Bootstrap 5** - Framework UI responsive
- **Bootstrap Icons** - Iconografía

#### Backend
- **Node.js 18+** - Runtime de JavaScript
- **TypeScript 5.8** - Lenguaje tipado
- **Express.js** - Framework web
- **PostgreSQL 16** - Base de datos relacional
- **JWT** - Autenticación sin estado
- **bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos

## Esquema de Base de Datos

### Tablas Principales

#### **Médicos** (`medico`)
```sql
CREATE TABLE medico (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Pacientes** (`paciente`)
```sql
CREATE TABLE paciente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    email VARCHAR(150),
    direccion TEXT,
    obra_social VARCHAR(100),
    localidad VARCHAR(100),
    medico_id INTEGER REFERENCES medico(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Consultas** (`consulta`)
```sql
CREATE TABLE consulta (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES paciente(id),
    medico_id INTEGER REFERENCES medico(id),
    fecha DATE NOT NULL,
    descripcion TEXT,
    diagnostico TEXT,
    tratamiento TEXT,
    estado VARCHAR(20) DEFAULT 'programada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Funcionalidades

### Módulo de Autenticación
- Login seguro con validación JWT
- Gestión de sesiones con tokens de acceso
- Protección de rutas con middleware de autenticación
- Encriptación de contraseñas con bcrypt

### Gestión de Pacientes
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Búsqueda avanzada por nombre, DNI, localidad u obra social
- Filtrado dinámico en tiempo real
- Validación de datos automática
- Asociación con médicos responsables

### Sistema de Consultas
- Calendario integrado con vista diaria
- Registro detallado de consultas médicas
- Historial cronológico de pacientes
- Estados de consulta (programada, completada, cancelada)
- Asociación con archivos médicos

### Manejo de Archivos
- Upload seguro de imágenes (JPG, PNG) y documentos (PDF)
- Validación de tipos MIME automática
- Límite de tamaño configurable (1MB por defecto)
- Almacenamiento local con nomenclatura única
- Asociación con consultas y pacientes

### Interfaz de Usuario
- Diseño responsive optimizado para móviles y escritorio
- Modo oscuro/claro con preferencias guardadas
- Sidebar navegable con iconos intuitivos
- Componentes interactivos con Bootstrap 5
- Feedback visual para todas las acciones

### Dashboard Principal
- Resumen de estadísticas diarias
- Acceso rápido a funcionalidades principales
- Navegación intuitiva entre módulos
- Notificaciones en tiempo real

## Seguridad y Validación

### Características de Seguridad
- **Autenticación JWT** con tokens seguros
- **Encriptación bcrypt** para contraseñas
- **Validación de entrada** en todos los endpoints
- **Sanitización automática** de datos
- **Headers de seguridad** con Helmet.js
- **Rate limiting** para prevenir ataques
- **Validación de tipos MIME** en archivos
- **Protección CSRF** en formularios

### Validaciones Implementadas
- **Datos de pacientes** con reglas de negocio
- **Formatos de fecha** y campos obligatorios
- **Tipos de archivo** permitidos
- **Tamaño máximo** de uploads
- **Caracteres especiales** en formularios

## Desarrollo

### Comandos Disponibles

```bash
# Backend - Desarrollo
cd back
npm run dev          # Servidor en modo desarrollo con ts-node
npm run dev:watch    # Servidor con recarga automática
npm run build        # Compilar TypeScript a JavaScript
npm run start        # Servidor en modo producción
npm run type-check   # Verificación de tipos TypeScript
npm run setup        # Configurar doctor inicial

# Frontend - Desarrollo  
cd UI
npm run start        # Servidor local para desarrollo
npm run dev          # Servidor con watch mode
npm run build        # Minificar CSS y JS
npm run format       # Formatear código con Prettier
npm run lint         # Linter para JavaScript
```

### Estructura de Desarrollo

#### Arquitectura Modular
- **Separación de responsabilidades** por módulos
- **Código reutilizable** con utilidades compartidas
- **Tipos TypeScript** para mejor documentación
- **Middleware personalizable** para validaciones

#### Estándares de Código
- **TypeScript** para tipado estático
- **ESLint** para consistencia de código
- **Prettier** para formateo automático
- **Commits semánticos** para historial claro
- **Documentación inline** con JSDoc

## API Endpoints

### Autenticación
```
POST /api/auth/login          # Iniciar sesión
POST /api/auth/logout         # Cerrar sesión
GET  /api/auth/verify         # Verificar token
```

### Pacientes
```
GET    /api/patients          # Listar pacientes
POST   /api/patients          # Crear paciente
PUT    /api/patients/:id      # Actualizar paciente
DELETE /api/patients/:id      # Eliminar paciente
GET    /api/patients/:id      # Obtener paciente específico
```

### Consultas
```
GET    /api/consultations     # Listar consultas
POST   /api/consultations     # Crear consulta
PUT    /api/consultations/:id # Actualizar consulta
DELETE /api/consultations/:id # Eliminar consulta
GET    /api/consultations/patient/:id # Consultas por paciente
```

### Archivos
```
POST   /api/files/upload      # Subir archivo
GET    /api/files/:id         # Descargar archivo
DELETE /api/files/:id         # Eliminar archivo
```

### Funcionalidades Excel
```
POST   /api/excel/import      # Importar datos desde Excel
GET    /api/excel/export      # Exportar datos a Excel
```

## Despliegue

### Desarrollo Local
```bash
# Clonar repositorio
git clone https://github.com/GustavoValkovich/medilogs.git
cd medilogs

# Configurar backend
cd back
npm install
cp .env.example .env  # Configurar variables de entorno
npm run build
npm run dev
```

### Producción
```bash
# Compilar código TypeScript
npm run build

# Iniciar servidor en producción
npm run start:prod

# Con PM2 (recomendado)
npm install -g pm2
pm2 start dist/core/server-safe.js --name medilogs
```

### Docker
```bash
# Usar Docker Compose
docker-compose up -d

# O construir imagen manualmente
docker build -t medilogs .
docker run -p 3000:3000 medilogs
```

## Testing y Calidad

### Checklist de Funcionamiento

#### Backend
- [x] Servidor inicia correctamente en puerto 3000
- [x] Base de datos PostgreSQL conectada
- [x] Endpoints API responden correctamente
- [x] Autenticación JWT funcional
- [x] Upload de archivos operativo
- [x] Middleware de seguridad activo

#### Frontend
- [x] Login carga sin errores
- [x] Autenticación exitosa redirige al dashboard
- [x] Dashboard muestra datos correctamente
- [x] Navegación entre páginas funcional
- [x] Formularios validan datos correctamente
- [x] Responsive design operativo

#### Integración
- [x] API y Frontend sincronizados
- [x] Datos se guardan correctamente
- [x] Archivos se suben sin problemas
- [x] Filtros y búsquedas funcionan
- [x] Manejo de errores robusto

### Pruebas del Sistema

```bash
# Verificar funcionamiento completo
cd back && npm run dev

# Acceder al sistema
open UI/login.html

# Credenciales de prueba
Usuario: DianaPacientes
Contraseña: 123456
```

## Roadmap

### Próximas Versiones
- **v3.1.0** - Módulo de reportes avanzados
- **v3.2.0** - Integración con DICOM
- **v3.3.0** - API móvil nativa
- **v4.0.0** - Arquitectura microservicios

### Características Planificadas
- Negatoscopio digital
- Integración con sistemas de laboratorio
- Módulo de facturación
- Telemedicina integrada
- Inteligencia artificial para diagnósticos

## Contribución

### Proceso de Contribución
1. Fork el repositorio
2. Crear una rama para la feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código
- Seguir las convenciones de TypeScript
- Incluir tests para nuevas funcionalidades
- Documentar cambios en el README
- Usar commits semánticos

## Soporte

### Contacto
- **Email:** gustavo.valkovich@gmail.com
- **GitHub:** [@GustavoValkovich](https://github.com/GustavoValkovich)

### Recursos Útiles
- [Documentación técnica](./back/README.md)
- [Guía de Docker](./README_DOCKER.md)
- [Scripts de base de datos](./back/scripts/)

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**MediLogs v3.0.0** - Sistema de Gestión Médica Profesional

*Desarrollado por Gustavo Valkovich y Emiliano Druetta*

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](https://github.com/GustavoValkovich/medilogs)
[![Maintenance](https://img.shields.io/badge/Maintained-Yes-green.svg)](https://github.com/GustavoValkovich/medilogs)
[![Last Update](https://img.shields.io/badge/Last%20Update-August%202025-blue.svg)](https://github.com/GustavoValkovich/medilogs)

