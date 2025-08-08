# 🏥 MediLogs UI

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/gustavovalkovich/medilogs_UI)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple.svg)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Sistema moderno de gestión de pacientes médicos con interfaz responsive desarrollada en Bootstrap 5.

## 🚀 Características

- ✅ **Gestión Completa de Pacientes** - CRUD completo
- 🔍 **Búsqueda Avanzada** - Por nombre, DNI, localidad u obra social
- 📅 **Calendario Integrado** - Gestión de citas y entradas
- 📊 **Panel de Consultas** - Historial médico organizado
- 📱 **Diseño Responsive** - Optimizado para todos los dispositivos
- 🎨 **UI Moderna** - Interfaz profesional con Bootstrap 5

## 📁 Estructura del Proyecto

```
medilogs_UI/
├── 📄 index.html              # Página principal
├── 📦 package.json            # Configuración del proyecto
├── 🔧 .gitignore             # Archivos ignorados por Git
├── 🎛️ .eslintrc.json         # Configuración ESLint
├── 💅 .prettierrc.json       # Configuración Prettier
├── 📁 assets/                # Recursos estáticos
│   ├── 🎨 css/               # Archivos de estilos
│   │   └── styles.css        # Estilos personalizados
│   ├── ⚡ js/                # Archivos JavaScript
│   │   └── script.js         # Funcionalidad principal
│   └── 🖼️ img/               # Imágenes y recursos gráficos
├── 📁 src/                   # Código fuente
│   ├── 🧩 components/        # Componentes reutilizables
│   └── 📄 pages/             # Páginas adicionales
└── 📁 docs/                  # Documentación
    └── README.md             # Documentación detallada
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 16+ y npm 8+ (para herramientas de desarrollo)
- Navegador web moderno
- Editor de código (VS Code recomendado)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/gustavovalkovich/medilogs_UI.git
   cd medilogs_UI
   ```

2. **Instalar dependencias de desarrollo** (opcional)
   ```bash
   npm install
   ```

3. **Ejecutar el proyecto**
   ```bash
   # Opción 1: Abrir directamente en navegador
   open index.html

   # Opción 2: Usar live-server (requiere npm install)
   npm start
   ```

## 🎯 Scripts Disponibles

```bash
npm start          # Servidor de desarrollo en puerto 3000
npm run dev        # Servidor con watch en archivos CSS/JS
npm run build      # Minificar archivos CSS y JS
npm run lint       # Verificar código con ESLint
npm run format     # Formatear código con Prettier
npm run validate   # Validar HTML
```

## 💻 Uso

### Pantalla Principal

La interfaz principal incluye:

1. **Sidebar Lateral**: Navegación con 3 botones circulares
   - 👤 Gestión de Pacientes
   - ⚫⚪ Reportes y Estadísticas
   - ⚙️ Configuración del Sistema

2. **Panel Principal**: Gestión completa de pacientes
   - Tabla con información detallada
   - Búsqueda en tiempo real
   - Botones de acción (Agregar, Editar, Ver historial)

3. **Paneles Secundarios**:
   - 📅 Calendario de Entradas
   - 💬 Consultas Recientes

### Funcionalidades Implementadas

- [x] Interfaz responsive con Bootstrap 5
- [x] Tabla interactiva de pacientes
- [x] Sistema de búsqueda en tiempo real
- [x] Navegación con sidebar
- [x] Tooltips informativos
- [x] Efectos hover y animaciones

### Próximas Implementaciones

- [ ] Conexión con backend/API
- [ ] Sistema de autenticación
- [ ] Módulo de historiales médicos
- [ ] Calendario funcional
- [ ] Reportes y estadísticas
- [ ] Gestión de usuarios y permisos

## 🎨 Personalización

### Colores del Sistema

Los colores principales se pueden modificar en `assets/css/styles.css`:

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --info-color: #17a2b8;
  --warning-color: #ffc107;
}
```

### Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1199px
- **Desktop**: 1200px+

## 🔧 Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con gradientes y animaciones
- **JavaScript ES6+** - Funcionalidad interactiva
- **Bootstrap 5.3.2** - Framework CSS responsive
- **Bootstrap Icons** - Iconografía profesional

## 📱 Compatibilidad

### Navegadores Soportados

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Dispositivos

- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (320x568+)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Gustavo Valkovich**
- Email: [gustavo.valkovich@mgmail.com](mailto:gustavo.valkovich@mgmail.com)
- LinkedIn: [Gustavo Valkovich](https://linkedin.com/in/gustavovalkovich)

**Emiliano Druetta**
- Email: [druettaemiliano@mgmail.com](mailto:druettaemiliano@mgmail.com)
- LinkedIn: [Emiliano Druetta](https://linkedin.com/in/druettaemiliano)


## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@medilogs.com
- 🐛 Issues: [GitHub Issues](https://github.com/gustavovalkovich/medilogs_UI/issues)
- 📖 Docs: [Documentación Completa](docs/README.md)

---

**MediLogs UI** © 2025 - Sistema de gestión médica profesional
