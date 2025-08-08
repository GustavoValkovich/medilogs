# 🏥 MediLogs - Sistema de Gestión Médica

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Sistema web moderno para gestión integral de pacientes, consultas médicas y archivos clínicos con arquitectura modular y seguridad avanzada.**

[Características](#-características-principales) •
[Instalación](#-instalación-rápida) •
[Documentación](#-documentación) •
[Soporte](#-soporte-técnico)

</div>

## 🎯 Características Principales

### � **Seguridad Avanzada**
- Autenticación JWT con tokens seguros
- Encriptación de contraseñas con bcrypt
- Validación de datos y sanitización automática
- Headers de seguridad con Helmet
- Rate limiting por IP

### 👥 **Gestión de Pacientes**
- CRUD completo con validaciones
- Búsqueda avanzada por múltiples criterios
- Historial médico completo
- Gestión de datos sensibles

### 📅 **Sistema de Consultas**
- Calendario integrado con vista diaria
- Registro de consultas detallado
- Historial cronológico de pacientes
- Estados de consulta (programada, completada, cancelada)

### 📁 **Manejo de Archivos**
- Upload seguro de imágenes (JPG, PNG) y documentos (PDF)
- Validación de tipos MIME
- Límite de tamaño configurable
- Almacenamiento local con nomenclatura única

### 🎨 **Interfaz Moderna**
- Diseño responsive con Bootstrap 5
- Modo oscuro/claro
- Sidebar navegable
- Componentes interactivos

## 🚀 Instalación Rápida

### Prerrequisitos
```bash
# Verificar versiones
node --version    # v18.0.0+
npm --version     # v8.0.0+
psql --version    # v16.0+
```

### 1. Configuración del Backend
```bash
cd back
npm install
npm run build
npm run dev
```

### 2. Configuración de Base de Datos
```sql
-- Crear base de datos PostgreSQL
CREATE DATABASE medilogs;
CREATE USER medilogs WITH PASSWORD 'Medilogs335!';
GRANT ALL PRIVILEGES ON DATABASE medilogs TO medilogs;
```

### 3. Variables de Entorno
```bash
# Crear archivo .env en /back
cp .env.example .env
```

### 4. Acceso al Sistema
```bash
# Frontend
open UI/login.html

# O usar servidor local
npx serve UI/
```

### 5. Credenciales de Prueba
```
Usuario: DianaPacientes
Contraseña: 123456
```

## 🏗️ Arquitectura del Sistema

### Estructura del Proyecto
```
medilogs_UI-back_final/
├── 🎨 UI/                          # Frontend (Cliente Web)
│   ├── 📄 index.html               # Dashboard principal
│   ├── 🔐 login.html               # Página de autenticación
│   ├── 👥 agregar-paciente.html    # Gestión de pacientes
│   ├── 📝 historial.html           # Historial médico
│   ├── ⚡ script.js                # Lógica principal del dashboard
│   ├── 🎛️ config.js               # Configuración del frontend
│   └── 📁 assets/                  # Recursos estáticos
│       ├── 🎨 css/                 # Estilos modulares
│       │   ├── styles.css          # Estilos principales
│       │   ├── login.css           # Estilos de autenticación
│       │   ├── components.css      # Componentes UI
│       │   └── layout.css          # Diseño y estructura
│       └── ⚡ js/                   # JavaScript del cliente
│           ├── api.js              # Cliente API REST
│           ├── login.js            # Lógica de autenticación
│           └── historial.js        # Gestión de historial
├── 🏗️ back/                        # Backend (Servidor API)
│   ├── 📁 src/                     # Código fuente TypeScript
│   │   ├── 🧩 modules/             # Módulos por dominio
│   │   │   ├── 🔐 auth/            # Autenticación y autorización
│   │   │   ├── 👥 patients/        # Gestión de pacientes
│   │   │   ├── 👨‍⚕️ doctors/          # Gestión de médicos
│   │   │   ├── 📅 consultations/   # Consultas médicas
│   │   │   └── 📁 files/           # Manejo de archivos
│   │   ├── 🔧 config/              # Configuración de base de datos
│   │   ├── 🤝 shared/              # Utilidades compartidas
│   │   └── 📘 types/               # Definiciones de tipos TypeScript
│   ├── 📁 dist/                    # Código compilado
│   ├── 📁 uploads/                 # Archivos subidos
│   ├── 📁 scripts/                 # Scripts de base de datos
│   ├── 🔐 .env                     # Variables de entorno
│   └── 📦 package.json             # Dependencias del backend
└── 📚 docs/                        # Documentación adicional
```

### Tecnologías Utilizadas

<div align="center">

#### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

#### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### **`medico`** - Gestión de Médicos
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

#### **`paciente`** - Gestión de Pacientes
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

#### **`consulta`** - Registro de Consultas
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

## � Funcionalidades Implementadas

### ✅ **Módulo de Autenticación**
- **Login seguro** con validación JWT
- **Gestión de sesiones** con tokens de acceso
- **Protección de rutas** con middleware de autenticación
- **Encriptación** de contraseñas con bcrypt

### 👥 **Gestión de Pacientes**
- **CRUD completo** (Crear, Leer, Actualizar, Eliminar)
- **Búsqueda avanzada** por nombre, DNI, localidad u obra social
- **Filtrado dinámico** en tiempo real
- **Validación de datos** automática
- **Asociación con médicos** responsables

### 📅 **Sistema de Consultas**
- **Calendario integrado** con vista diaria
- **Registro detallado** de consultas médicas
- **Historial cronológico** de pacientes
- **Estados de consulta** (programada, completada, cancelada)
- **Asociación con archivos** médicos

### 📁 **Manejo de Archivos**
- **Upload seguro** de imágenes (JPG, PNG) y documentos (PDF)
- **Validación de tipos MIME** automática
- **Límite de tamaño** configurable (1MB por defecto)
- **Almacenamiento local** con nomenclatura única
- **Asociación con consultas** y pacientes

### 🎨 **Interfaz de Usuario**
- **Diseño responsive** optimizado para móviles y escritorio
- **Modo oscuro/claro** con preferencias guardadas
- **Sidebar navegable** con iconos intuitivos
- **Componentes interactivos** con Bootstrap 5
- **Feedback visual** para todas las acciones

### 📊 **Dashboard Principal**
- **Resumen de estadísticas** diarias
- **Acceso rápido** a funcionalidades principales
- **Navegación intuitiva** entre módulos
- **Notificaciones** en tiempo real

## 🔒 Seguridad y Validación

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

## 🔧 Desarrollo y Mantenimiento

### Comandos de Desarrollo

```bash
# Backend - Desarrollo
cd back
npm run dev          # Servidor en modo desarrollo
npm run build        # Compilar TypeScript a JavaScript
npm run start        # Servidor en modo producción
npm run test         # Ejecutar pruebas unitarias

# Frontend - Desarrollo  
cd UI
npx serve .          # Servidor local para desarrollo
npx prettier --write .  # Formatear código
npx eslint .         # Linter para JavaScript
```

### Estructura de Desarrollo

#### 🏗️ **Arquitectura Modular**
- **Separación de responsabilidades** por módulos
- **Código reutilizable** con utilidades compartidas
- **Tipos TypeScript** para mejor documentación
- **Middleware customizable** para validaciones

#### 📋 **Estándares de Código**
- **ESLint** para consistencia de código
- **Prettier** para formateo automático
- **Commits semánticos** para historial claro
- **Documentación inline** con JSDoc

## 🧪 Testing y Calidad

### Checklist de Funcionamiento

#### ✅ **Backend**
- [x] Servidor inicia correctamente en puerto 3000
- [x] Base de datos PostgreSQL conectada
- [x] Endpoints API responden correctamente
- [x] Autenticación JWT funcional
- [x] Upload de archivos operativo

#### ✅ **Frontend**
- [x] Login carga sin errores
- [x] Autenticación exitosa redirige al dashboard
- [x] Dashboard muestra datos correctamente
- [x] Navegación entre páginas funcional
- [x] Formularios validan datos correctamente

#### ✅ **Integración**
- [x] API y Frontend sincronizados
- [x] Datos se guardan correctamente
- [x] Archivos se suben sin problemas
- [x] Filtros y búsquedas funcionan
- [x] Responsive design en todos los dispositivos

### Pruebas del Sistema

```bash
# Verificar funcionamiento completo
cd back && npm run dev

# Abrir frontend en navegador
open UI/login.html

# Credenciales de prueba
Usuario: DianaPacientes
Contraseña: 123456
```

## 📚 Documentación

### API Endpoints

#### 🔐 **Autenticación**
```
POST /api/auth/login          # Iniciar sesión
POST /api/auth/logout         # Cerrar sesión
GET  /api/auth/verify         # Verificar token
```

#### 👥 **Pacientes**
```
GET    /api/patients          # Listar pacientes
POST   /api/patients          # Crear paciente
PUT    /api/patients/:id      # Actualizar paciente
DELETE /api/patients/:id      # Eliminar paciente
GET    /api/patients/:id      # Obtener paciente específico
```

#### 📅 **Consultas**
```
GET    /api/consultations     # Listar consultas
POST   /api/consultations     # Crear consulta
PUT    /api/consultations/:id # Actualizar consulta
DELETE /api/consultations/:id # Eliminar consulta
GET    /api/consultations/patient/:id # Consultas por paciente
```

#### 📁 **Archivos**
```
POST   /api/files/upload      # Subir archivo
GET    /api/files/:id         # Descargar archivo
DELETE /api/files/:id         # Eliminar archivo
```

### Variables de Entorno

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
UPLOAD_MAX_SIZE=1048576  # 1MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
```

## 🛠️ Despliegue

### Desarrollo Local
```bash
# Clonar repositorio
git clone https://github.com/GustavoValkovich/medilogs_UI-back_final.git
cd medilogs_UI-back_final

# Instalar dependencias
cd back && npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor
npm run dev
```

### Producción
```bash
# Compilar código TypeScript
npm run build

# Iniciar servidor en producción
npm run start

# Con PM2 (recomendado)
npm install -g pm2
pm2 start ecosystem.config.js
```

## 🚀 Características Avanzadas

### 🎨 **Negatoscopio Digital**
- Visualización de imágenes médicas
- Zoom y herramientas de medición
- Anotaciones y marcadores
- Comparación de imágenes

### 📊 **Reportes y Estadísticas**
- Reportes mensuales automáticos
- Gráficos de consultas por período
- Estadísticas de pacientes
- Exportación a PDF/Excel

### 🔄 **Sincronización en Tiempo Real**
- Updates automáticos del dashboard
- Notificaciones instantáneas
- Sincronización multi-dispositivo
- Backup automático

## 🌟 Roadmap

### 🚧 **Próximas Versiones**
- [ ] **v1.1.0** - Módulo de reportes avanzados
- [ ] **v1.2.0** - Integración con DICOM
- [ ] **v1.3.0** - API móvil nativa
- [ ] **v2.0.0** - Arquitectura microservicios

### 💡 **Características Planificadas**
- Integración con sistemas de laboratorio
- Módulo de facturación
- Telemedicina integrada
- Inteligencia artificial para diagnósticos

## 📞 Soporte Técnico

### 🆘 **Contacto**
- **Email:** gustavo.valkovich@example.com
- **GitHub:** [@GustavoValkovich](https://github.com/GustavoValkovich)
- **Issues:** [GitHub Issues](https://github.com/GustavoValkovich/medilogs_UI-back_final/issues)

### 📋 **Recursos Útiles**
- [Documentación completa](./docs/README.md)
- [Guía de contribución](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [Licencia MIT](./LICENSE)

---

<div align="center">

**MediLogs v1.0.0** - Sistema de Gestión Médica

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)
![Maintenance](https://img.shields.io/badge/Maintained-Yes-green.svg)
![Last Update](https://img.shields.io/badge/Last%20Update-July%202025-blue.svg)

*Desarrollado por Gustavo Valkovich y Emiliano Druetta*

</div>
  - Subida de documentos médicos
  - Gestión de imágenes
  
- **API REST completa**
  - Endpoints documentados
  - Validación de datos
  - Manejo de errores

### 🔄 En desarrollo
- Negatoscopio digital
- Reportes médicos
- Integración con sistemas externos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos (Bootstrap 5)
- **JavaScript ES6+** - Lógica del cliente
- **Bootstrap 5** - Framework UI
- **Bootstrap Icons** - Iconografía

### Backend
- **Node.js** - Runtime
- **TypeScript** - Lenguaje principal
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Multer** - Manejo de archivos
- **bcrypt** - Encriptación de contraseñas

## � Seguridad

- Validación de entrada de datos
- Encriptación de contraseñas con bcrypt
- Sanitización de consultas SQL
- Manejo seguro de archivos subidos
- Validación de tipos de archivo

## �📝 Desarrollo

### Comandos útiles

```bash
# Backend
cd back
npm run dev          # Desarrollo
npm run build        # Compilar TypeScript
npm run start        # Producción

# Logs en tiempo real
tail -f logs/app.log
```

