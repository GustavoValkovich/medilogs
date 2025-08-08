# MediLogs Backend v3.0.0

**Sistema de gestión médica optimizado** con arquitectura modular, seguridad avanzada y manejo de archivos.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Express](https://img.shields.io/badge/Express-4.x-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## Descripción

MediLogs es un sistema backend completo para la gestión de historias clínicas, desarrollado con **Node.js** y **TypeScript**. Implementa una **arquitectura modular** con seguridad avanzada, upload de archivos, y soporte para Docker.

## Scripts de Desarrollo

### Desarrollo con Docker (Recomendado)

```bash
# Iniciar desarrollo con verificación automática de Docker
npm run dev
```

Este comando ejecuta `./scripts/dev-with-docker.sh` que:
1. Verifica que Docker esté corriendo
2. Crea/inicia el contenedor PostgreSQL si es necesario
3. Espera a que PostgreSQL esté listo
4. Configura las variables de entorno
5. Inicia el servidor de desarrollo

### Scripts Docker Avanzados

```bash
# Script avanzado con opciones
npm run dev:docker

# Opciones disponibles:
npm run dev:docker:fresh     # Recrear contenedores desde cero
npm run dev:docker:logs      # Ver logs de PostgreSQL
npm run dev:docker:status    # Ver estado de contenedores
npm run dev:docker:stop      # Detener contenedores
```

### Desarrollo Local

```bash
# Usar PostgreSQL local (instalado con Homebrew)
npm run dev:local

# Con recarga automática
npm run dev:watch
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Iniciar en producción
npm run start

# Con PM2
npm run start:prod
```

## Características Principales

### Arquitectura Modular
- **Estructura modular** organizada por dominios (patients, consultations, doctors, files, auth)
- **Separación clara** entre controladores, repositorios y rutas
- **Middleware compartido** para validaciones, logging y manejo de errores

### 👥 **Gestión de Pacientes**
- CRUD completo con validaciones
- Búsqueda y filtrado avanzado
- Paginación y ordenamiento
- Gestión de datos médicos sensibles

### 📅 **Gestión de Consultas Médicas**
- Historias clínicas detalladas
- Asociación con archivos multimedia
- Filtros por fecha, paciente y médico
- Estados de consulta (programada, completada, cancelada)

### 👨‍⚕️ **Gestión de Médicos**
- Registro y autenticación
- Perfiles profesionales
- Asociación con pacientes y consultas

### 📁 **Sistema de Archivos**
- Upload seguro de imágenes (JPG, PNG) y documentos (PDF)
- Límite de tamaño configurable (1MB por defecto)
- Validación de tipos MIME
- Almacenamiento local con nomenclatura única

### 🔐 **Seguridad Avanzada**
- Autenticación con JWT
- Rate limiting por IP
- Validación de entrada automática
- Headers de seguridad con Helmet
- Sanitización de datos

## 🛠️ Stack Tecnológico

### **Backend Core**
- **Node.js** 18+ - Runtime de JavaScript
- **TypeScript** 5.8.3 - Tipado estático
- **Express.js** 4.x - Framework web minimalista
- **ts-node** - Ejecución directa de TypeScript

### **Base de Datos**
- **PostgreSQL** 16+ - Base de datos principal
- **SQLite** 3.x - Fallback para desarrollo
- **pg** - Driver PostgreSQL para Node.js

### **Seguridad & Middleware**
- **Helmet** - Headers de seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **express-rate-limit** - Rate limiting
- **bcrypt** - Hashing de contraseñas
- **multer** - Upload de archivos

### **Utilidades**
- **compression** - Compresión gzip
- **dotenv** - Variables de entorno
- **node-fetch** - Cliente HTTP para testing

## 📁 Estructura del Proyecto

```
src/
├── core/                      # Núcleo de la aplicación
│   ├── app.ts                # Configuración Express principal
│   ├── server.ts             # Servidor HTTP y inicialización
│   └── config.ts             # Configuración global
├── modules/                   # Arquitectura modular por dominio
│   ├── auth/                 # Autenticación y autorización
│   ├── patients/             # Gestión de pacientes
│   ├── consultations/        # Gestión de consultas médicas
│   ├── doctors/              # Gestión de médicos
│   └── files/                # Upload y gestión de archivos
├── controllers/               # Controladores de base de datos
│   ├── paciente-db.controller.ts
│   ├── consulta-db.controller.ts
│   └── medico-db.controller.ts
├── repositories/              # Capa de acceso a datos
│   ├── paciente-db.repository.ts
│   ├── consulta-db.repository.ts
│   └── medico-db.repository.ts
├── shared/                    # Utilidades compartidas
│   ├── middleware/           # Middleware personalizado
│   └── utils/                # Funciones utilitarias
├── types/                     # Definiciones TypeScript
└── config/                    # Configuración de servicios
    ├── database.ts           # Configuración BD
    └── sqlite.ts             # Configuración SQLite

tests/                         # Scripts de testing
uploads/                       # Archivos subidos por usuarios
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- PostgreSQL 16+ (opcional, usa SQLite como fallback)
- npm o yarn

### **1. Clonar e Instalar**
```bash
# Clonar repositorio
git clone https://github.com/GustavoValkovich/medilogs3.git
cd medilogs4

# Instalar dependencias
npm install
```

### **2. Configurar Variables de Entorno**
```bash
# Crear archivo .env
touch .env

# Configurar variables (opcional)
echo "DB_HOST=localhost" >> .env
echo "DB_PORT=5432" >> .env
echo "DB_NAME=medilogs" >> .env
echo "DB_USER=postgres" >> .env
echo "DB_PASSWORD=tu_password" >> .env
echo "JWT_SECRET=tu_jwt_secret" >> .env
echo "PORT=3000" >> .env
```

### **3. Ejecutar**
```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm run build
npm start

# Verificar tipos sin compilar
npm run type-check
```

## 📡 API Endpoints

### **🏥 Core**
- `GET /health` - Health check del sistema
- `GET /api` - Información de la API

### **👥 Pacientes** (`/api/patients` | `/api/pacientes`)
- `GET /` - Listar pacientes (paginado)
- `GET /:id` - Obtener paciente por ID
- `POST /` - Crear nuevo paciente
- `PUT /:id` - Actualizar paciente
- `DELETE /:id` - Eliminar paciente (soft delete)

### **📅 Consultas** (`/api/consultations` | `/api/consultas`)
- `GET /` - Listar consultas (paginado)
- `GET /:id` - Obtener consulta por ID
- `POST /` - Crear nueva consulta
- `PUT /:id` - Actualizar consulta
- `DELETE /:id` - Eliminar consulta
- `GET /patient/:id` - Consultas por paciente
- `POST /with-files` - Crear consulta con archivos

### **👨‍⚕️ Médicos** (`/api/doctors` | `/api/medicos`)
- `GET /` - Listar médicos
- `GET /:id` - Obtener médico por ID
- `POST /` - Crear nuevo médico
- `PUT /:id` - Actualizar médico
- `DELETE /:id` - Eliminar médico

### **📁 Archivos** (`/api/files`)
- `GET /info` - Información de upload
- `POST /upload` - Subir archivo individual
- `POST /upload/consultation` - Subir múltiples archivos
- `DELETE /:filename` - Eliminar archivo
- `GET /check/:filename` - Verificar existencia

### **🔐 Autenticación** (`/api/auth`)
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario
- `POST /logout` - Cerrar sesión

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con auto-reload
npm run dev:watch        # Servidor con nodemon
npm run dev:clean        # Limpiar y ejecutar

# Compilación
npm run build            # Compilar TypeScript
npm run type-check       # Verificar tipos
npm run clean            # Limpiar directorio dist/

# Producción
npm start                # Servidor de producción
npm run start:prod       # Servidor con NODE_ENV=production

# Utilidades
npm run audit:fix        # Corregir vulnerabilidades
```

## 🗄️ Base de Datos

### **Esquema Principal**
```sql
-- Tabla de pacientes
CREATE TABLE paciente (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  documento VARCHAR(20) UNIQUE NOT NULL,
  nacimiento DATE,
  sexo VARCHAR(10),
  obra_social VARCHAR(100),
  mail VARCHAR(100),
  importante TEXT,
  medico_id INTEGER
);

-- Tabla de consultas
CREATE TABLE consulta (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES paciente(id),
  fecha_historia DATE NOT NULL,
  historia TEXT NOT NULL,
  imagen TEXT
);

-- Tabla de médicos
CREATE TABLE medico (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
```

### **Configuración Automática**
- **PostgreSQL**: Conexión principal con pool de conexiones
- **SQLite**: Fallback automático si PostgreSQL no está disponible
- **Migraciones**: Automáticas al iniciar (si las tablas no existen)

## 📁 Sistema de Archivos

### **Características**
- **Tipos permitidos**: JPG, PNG, PDF
- **Tamaño máximo**: 1MB por archivo
- **Almacenamiento**: Local en `/uploads`
- **Nomenclatura**: `timestamp_consultaId_nombreSanitizado.ext`
- **Acceso directo**: `http://servidor/uploads/archivo.jpg`

### **Validaciones de Seguridad**
- Verificación de tipo MIME real
- Validación de extensión
- Sanitización de nombres
- Prevención de path traversal

## 🔒 Seguridad Implementada

- **🛡️ Helmet**: Headers de seguridad HTTP
- **⚡ Rate Limiting**: 100 requests por 15 minutos por IP
- **🔐 CORS**: Configuración restrictiva de dominios
- **📝 Validación**: Sanitización automática de entrada
- **🗂️ Upload**: Validación estricta de archivos
- **🔑 Autenticación**: JWT con bcrypt para passwords

## 🧪 Testing

```bash
# Ejecutar tests de archivos
node tests/test-files.js

# Ejecutar tests de consultas
node tests/test-consultations.js

# Test de conexión a BD
node tests/test-db.js
```

## 🐛 Debugging y Logs

### **Sistema de Logging**
- **Formato**: JSON estructurado
- **Niveles**: INFO, WARN, ERROR
- **Salida**: Consola con colores
- **Contexto**: Request ID, timestamp, módulo

### **Health Check Detallado**
```bash
curl http://localhost:3000/health
```
Retorna: estado del sistema, uptime, memoria, conexión BD

## 🚀 Deployment

### **Variables de Entorno para Producción**
```bash
NODE_ENV=production
PORT=3000
DB_HOST=tu_host_postgres
DB_NAME=medilogs_prod
DB_USER=usuario_prod
DB_PASSWORD=password_seguro
JWT_SECRET=secret_muy_seguro_256_bits
```

### **Docker (Opcional)**
```bash
# Build imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run
```

## 📄 Licencia

ISC License - Ver archivo LICENSE para más detalles.

**Gustavo Valkovich**
- Email: [gustavo.valkovich@mgmail.com](mailto:gustavo.valkovich@mgmail.com)
- LinkedIn: [Gustavo Valkovich](https://linkedin.com/in/gustavovalkovich)

**Emiliano Druetta**
- Email: [druettaemiliano@mgmail.com](mailto:druettaemiliano@mgmail.com)
- LinkedIn: [Emiliano Druetta](https://linkedin.com/in/druettaemiliano)

---

## 📝 Notas de Desarrollo

- ✅ **Arquitectura limpia** - Sin duplicaciones ni archivos legacy
- ✅ **TypeScript estricto** - Tipado completo en todo el proyecto  
- ✅ **Modular** - Fácil escalabilidad y mantenimiento
- ✅ **Seguro** - Implementación de mejores prácticas de seguridad
- ✅ **Documentado** - README completo y código autodocumentado

**¡Listo para desarrollo y producción!** 
