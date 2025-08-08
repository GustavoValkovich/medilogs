// JavaScript limpio para MediLogs UI - SIN LOGS EXCESIVOS

/**
 * Función auxiliar para obtener headers de autenticación
 * Incluye fallback si getAuthHeaders no está disponible
 */
function getAuthHeadersSafe(options = {}) {
    let headers;
    
    if (typeof getAuthHeaders === 'function') {
        headers = getAuthHeaders();
        console.log('✅ Usando getAuthHeaders() global');
    } else {
        // Fallback si getAuthHeaders no está disponible
        console.log('⚠️ getAuthHeaders no disponible, usando fallback');
        const token = localStorage.getItem('token');
        headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    // Si es FormData, eliminar Content-Type para que el browser lo configure automáticamente
    if (options.isFormData) {
        delete headers['Content-Type'];
    }
    
    return headers;
}

// Estado global de la aplicación
let appState = {
    patients: [],
    allPatients: [], // Todos los pacientes para filtrado local
    filteredPatients: [],
    selectedPatient: null,
    loading: false,
    user: null,
    spinnersCleared: false,
    consultations: [],
    consultationsByDate: {},
    currentDate: new Date(),
    selectedDate: null,
    needsReload: false // Nuevo estado para controlar recargas
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Iniciando MediLogs...');
    
    // Verificar autenticación
    checkAuthentication();
    
    // Verificar si hay actualizaciones de pacientes
    checkPatientUpdates();
    
    // Inicializar aplicación
    initializeApp();
    
    // Configurar funcionalidad
    setupBasicFunctionality();
    
    // Configurar detección de cambios en focus de ventana
    setupWindowFocusDetection();
    
    console.log('✅ MediLogs iniciado');
});

/**
 * Verificación de autenticación simple
 */
function checkAuthentication() {
    try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            appState.user = JSON.parse(userData);
            console.log('👤 Usuario:', appState.user.nombre);
        }
    } catch (error) {
        console.warn('⚠️ Error en autenticación:', error.message);
    }
}

/**
 * Inicializar aplicación
 */
function initializeApp() {
    // Ocultar spinner principal
    const mainSpinner = document.getElementById('loadingSpinner');
    if (mainSpinner) {
        mainSpinner.style.display = 'none';
    }
    
    // Cargar pacientes
    loadPatients();
    
    // Cargar todas las consultas
    loadAllConsultations();
    
    // Inicializar calendario con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        initializeCalendar();
        // Seleccionar el día actual por defecto
        setTimeout(() => {
            selectTodayInCalendar();
        }, 200);
    }, 100);
}

/**
 * Cargar pacientes - VERSIÓN COMPLETA SIN PAGINACIÓN
 */
async function loadPatients() {
    const tableBody = document.getElementById('patientsTableBody');
    const countElement = document.getElementById('patientsCount');
    
    if (!tableBody) return;
    
    // Mostrar spinner SOLO UNA VEZ
    if (!appState.spinnersCleared) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    Cargando todos los pacientes...
                </td>
            </tr>
        `;
        if (countElement) countElement.textContent = 'Cargando...';
    }

    try {
        // 🔒 SEGURIDAD: Obtener token JWT del localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('❌ [SEGURIDAD] No hay token de autenticación, redirigiendo al login');
            window.location.href = 'login.html';
            return;
        }

        // 🔒 SEGURIDAD: Construir headers con autenticación
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Construir URL - ya no necesitamos medico_id porque se usa el token
        let url = 'http://localhost:3000/api/patients?limit=10000';
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const allPatients = data.data && data.data.data ? data.data.data : [];
        
        // LIMPIAR TABLA COMPLETAMENTE
        tableBody.innerHTML = '';
        appState.spinnersCleared = true;
        
        // Actualizar contadores
        if (countElement) {
            countElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi bi-people me-2"></i>
                    <span><strong>${allPatients.length}</strong> pacientes en total</span>
                    ${allPatients.length > 20 ? '<small class="text-muted ms-2">(use scroll para navegar)</small>' : ''}
                </div>
            `;
        }
        
        if (allPatients.length > 0) {
            // Renderizar TODOS los pacientes de una vez
            renderPatients(allPatients);
            appState.patients = allPatients;
            appState.allPatients = allPatients; // Para búsquedas con palabras clave
            appState.filteredPatients = allPatients;
            console.log(`✅ Todos los ${allPatients.length} pacientes cargados y mostrados`);
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        <i class="bi bi-info-circle me-2"></i>
                        No hay pacientes registrados
                    </td>
                </tr>
            `;
            if (countElement) countElement.textContent = 'No hay pacientes';
        }
    } catch (error) {
        console.error('❌ Error cargando pacientes:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error: ${error.message}
                </td>
            </tr>
        `;
        appState.spinnersCleared = true;
        if (countElement) countElement.textContent = 'Error al cargar';
    }
}

/**
 * Renderizar tabla de pacientes - VERSIÓN SIMPLE
 */
function renderPatients(patients, append = false) {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) return;
    
    // Solo limpiar si no es append
    if (!append) {
        tableBody.innerHTML = '';
    }
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.className = 'patient-row';
        
        // Agregar data attribute para identificar el paciente
        row.setAttribute('data-patient-id', patient.id);
        
        // Calcular edad
        const birthDate = new Date(patient.nacimiento);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        // Formatear sexo
        const sexoDisplay = patient.sexo === 'M' ? 'Masculino' : 
                           patient.sexo === 'F' ? 'Femenino' : 'N/A';
        
        row.innerHTML = `
            <td style="padding: 0.5rem; font-size: 0.875rem;">${patient.id}</td>
            <td style="padding: 0.5rem; font-size: 0.875rem;"><strong>${patient.nombre}</strong></td>
            <td style="padding: 0.5rem; font-size: 0.875rem;">${patient.nacimiento ? new Date(patient.nacimiento).toLocaleDateString('es-ES') : 'N/A'}</td>
            <td style="padding: 0.5rem; font-size: 0.875rem;">${age > 0 ? age + ' años' : 'N/A'}</td>
            <td style="padding: 0.5rem; font-size: 0.875rem;">${sexoDisplay}</td>
            <td style="padding: 0.5rem; font-size: 0.875rem;">${patient.documento || 'N/A'}</td>
            <td style="padding: 0.5rem; font-size: 0.875rem;">${patient.localidad || 'N/A'}</td>
            <td style="padding: 0.5rem; font-size: 0.875rem;">${patient.obra_social || 'N/A'}</td>
            <td style="padding: 0.5rem; font-size: 0.875rem;">
                <button class="btn btn-sm btn-outline-info w-100" onclick="viewHistory(${patient.id}, '${patient.nombre}')" title="Ver historial" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                    <i class="bi bi-journal-medical"></i>
                </button>
            </td>
        `;
        
        // Agregar event listeners para long press (1.3 segundos)
        let pressTimer = null;
        let isLongPress = false;
        let pressStartTime = 0;
        
        // Función para iniciar el timer de long press
        const startPressTimer = (event) => {
            // No activar si se hace click en el botón de historial
            if (event.target.closest('button')) {
                return;
            }
            
            pressStartTime = Date.now();
            isLongPress = false;
            
            // Agregar clase visual para indicar que está siendo presionado
            row.classList.add('patient-row-pressing');
            
            pressTimer = setTimeout(() => {
                isLongPress = true;
                // Feedback visual y háptico para long press
                row.classList.remove('patient-row-pressing');
                row.classList.add('patient-row-longpress');
                
                // Vibración si está disponible
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                console.log('🔍 Long press detectado - Abriendo edición para paciente:', patient.id);
                openPatientEditor(patient);
                
                // Limpiar clase después de un momento
                setTimeout(() => {
                    row.classList.remove('patient-row-longpress');
                }, 200);
            }, 1300); // 1.3 segundos
        };
        
        // Función para cancelar el timer
        const cancelPressTimer = () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            row.classList.remove('patient-row-pressing');
            
            // Si fue un click corto (menos de 1.3s), mostrar mensaje informativo
            if (!isLongPress && pressStartTime > 0) {
                const pressDuration = Date.now() - pressStartTime;
                if (pressDuration > 50 && pressDuration < 1300) {
                    showQuickTip('Mantén presionado 1.3 segundos para editar el paciente');
                }
            }
            
            pressStartTime = 0;
        };
        
        // Event listeners para mouse
        row.addEventListener('mousedown', startPressTimer);
        row.addEventListener('mouseup', cancelPressTimer);
        row.addEventListener('mouseleave', cancelPressTimer);
        
        // Event listeners para touch (móviles)
        row.addEventListener('touchstart', startPressTimer, { passive: true });
        row.addEventListener('touchend', cancelPressTimer);
        row.addEventListener('touchcancel', cancelPressTimer);
        
        tableBody.appendChild(row);
    });
}

/**
 * Funciones de pacientes
 */
function viewHistory(id, name) {
    // Redirigir a la página de historial con parámetros
    const encodedName = encodeURIComponent(name);
    window.location.href = `historial.html?id=${id}&name=${encodedName}`;
}

function editPatient(id) {
    alert(`Editar paciente ID: ${id}\n(Función en desarrollo)`);
}

function deletePatient(id) {
    if (confirm('¿Eliminar este paciente?')) {
        alert(`Eliminar paciente ID: ${id}\n(Función en desarrollo)`);
    }
}

/**
 * Abrir editor de paciente
 */
function openPatientEditor(patient) {
    console.log('📝 Abriendo editor para paciente:', patient);
    
    // Guardar datos del paciente en localStorage para la pantalla de edición
    localStorage.setItem('editingPatient', JSON.stringify(patient));
    
    // Redirigir a la pantalla de edición
    window.location.href = 'editar-paciente.html';
}

/**
 * Configurar funcionalidad básica - VERSIÓN MEJORADA
 */
function setupBasicFunctionality() {
    // Búsqueda con debounce y feedback visual mejorado
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        
        // Agregar indicador visual al input
        const inputGroup = searchInput.closest('.input-group');
        if (inputGroup) {
            const searchIcon = inputGroup.querySelector('.input-group-text i');
            
            searchInput.addEventListener('input', function () {
                // Limpiar timeout anterior
                clearTimeout(searchTimeout);
                
                const query = this.value.trim();
                const clearBtn = document.getElementById('clearSearchBtn');
                
                // Mostrar/ocultar botón de limpiar
                if (clearBtn) {
                    if (query.length > 0) {
                        clearBtn.style.display = 'block';
                    } else {
                        clearBtn.style.display = 'none';
                    }
                }
                
                // Cambiar icono para indicar que está buscando
                if (searchIcon) {
                    searchIcon.className = 'bi bi-search';
                }
                
                // Si está vacío, cargar todos los pacientes
                if (!query) {
                    if (searchIcon) {
                        searchIcon.className = 'bi bi-search';
                    }
                    searchPatients(''); // Usar searchPatients para cargar todos
                    return;
                }
                
                // Mostrar que está procesando
                if (searchIcon && query.length > 0) {
                    searchIcon.className = 'bi bi-hourglass-split';
                }
                
                // Debounce de 500ms para evitar muchas peticiones
                searchTimeout = setTimeout(() => {
                    if (searchIcon) {
                        searchIcon.className = 'bi bi-search';
                    }
                    searchPatients(query);
                }, 500);
            });
            
            // Feedback visual cuando el input está activo
            searchInput.addEventListener('focus', function () {
                inputGroup.classList.add('focused');
            });
            
            searchInput.addEventListener('blur', function () {
                inputGroup.classList.remove('focused');
            });
        }
    }
    
    // Botón agregar paciente
    const addPatientBtn = document.getElementById('addPatientBtn');
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', function () {
            console.log('🏥 Redirigiendo a agregar paciente...');
            // Guardar el ID del médico en localStorage si no está
            if (appState.user && appState.user.id) {
                localStorage.setItem('medicoId', appState.user.id);
            }
            // Redirigir a la pantalla de agregar paciente
            window.location.href = 'agregar-paciente.html';
        });
    }
    
    // Botones del sidebar
    setupSidebarButtons();
    
    // Botón de limpiar búsqueda
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function () {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                
                // Restaurar icono de búsqueda
                const inputGroup = searchInput.closest('.input-group');
                if (inputGroup) {
                    const searchIcon = inputGroup.querySelector('.input-group-text i');
                    if (searchIcon) {
                        searchIcon.className = 'bi bi-search';
                    }
                }
                
                // Cargar todos los pacientes
                searchPatients('');
                searchInput.focus();
            }
        });
    }

    // Configurar botón de ayuda de búsqueda
    const searchHelpBtn = document.getElementById('searchHelpBtn');
    if (searchHelpBtn) {
        searchHelpBtn.addEventListener('click', function () {
            const modal = new bootstrap.Modal(document.getElementById('searchHelpModal'));
            modal.show();
        });
    }
}

/**
 * Configurar botones del sidebar
 */
function setupSidebarButtons() {
    // Botón de perfil
    const profileBtn = document.querySelector('[title="Perfil"]');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            const user = appState.user;
            const message = user ? 
                `Perfil de ${user.nombre}\nEmail: ${user.email || 'N/A'}` : 
                'No hay información de usuario disponible';
            alert(message);
        });
    }
    
    // Botón de configuración
    const configBtn = document.querySelector('[title="Configuración"]');
    if (configBtn) {
        configBtn.addEventListener('click', function() {
            alert('Panel de configuración\n(En desarrollo)');
        });
    }
}

/**
 * Inicializar calendario - VERSIÓN MEJORADA
 */
function initializeCalendar() {
    // Verificar que los elementos existan
    const monthYearElement = document.getElementById('currentMonthYear');
    const calendarDaysElement = document.getElementById('calendarDays');
    
    console.log('🔍 Elementos encontrados:', {
        monthYearElement: !!monthYearElement,
        calendarDaysElement: !!calendarDaysElement
    });
    
    if (!monthYearElement || !calendarDaysElement) {
        console.warn('⚠️ Elementos del calendario no encontrados, reintentando en 500ms...');
        setTimeout(() => initializeCalendar(), 500);
        return;
    }
    
    console.log('🗓️ Inicializando calendario...');
    
    appState.currentDate = new Date();
    displayCalendar(appState.currentDate);
    
    console.log('✅ Calendario inicializado correctamente');
}

/**
 * Mostrar calendario - VERSIÓN MEJORADA CON TRANSICIONES
 */
function displayCalendar(date) {
    const monthYearElement = document.getElementById('currentMonthYear');
    const calendarDaysElement = document.getElementById('calendarDays');
    
    if (!monthYearElement || !calendarDaysElement) {
        console.error('❌ Elementos del calendario no encontrados');
        return;
    }
    
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Mostrar mes y año sin animación
    monthYearElement.textContent = `${months[month]} ${year}`;
    
    // Limpiar días anteriores directamente sin delay
    calendarDaysElement.innerHTML = '';
    
    // Obtener primer día del mes y días en el mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Agregar días del mes anterior (grises)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i);
        const dayElement = createDayElement(prevDate.getDate(), true);
        calendarDaysElement.appendChild(dayElement);
    }
    
    // Agregar días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, year, month);
        
        // Marcar día actual
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Verificar si tiene eventos (consultas)
        const dayDate = new Date(year, month, day);
        if (hasEventsOnDate(dayDate)) {
            dayElement.classList.add('has-events');
        }
        
        calendarDaysElement.appendChild(dayElement);
    }
    
    // Completar las celdas restantes con días del mes siguiente (solo hasta 35 celdas total)
    const totalCells = calendarDaysElement.children.length;
    const maxCells = 35; // 5 semanas * 7 días
    const remainingCells = maxCells - totalCells;
    
    for (let day = 1; day <= remainingCells && day <= 7; day++) {
        const dayElement = createDayElement(day, true);
        calendarDaysElement.appendChild(dayElement);
    }
    
    console.log(`✅ Calendario generado: ${months[month]} ${year} - ${daysInMonth} días (${calendarDaysElement.children.length} celdas)`);
}

/**
 * Crear elemento de día
 */
function createDayElement(day, isOtherMonth, year, month) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    } else {
        dayElement.addEventListener('click', () => {
            // Remover selección anterior
            document.querySelectorAll('.calendar-day.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Seleccionar día actual
            dayElement.classList.add('selected');
            
            // Crear fecha seleccionada
            const selectedDate = new Date(year, month, day);
            
            // Actualizar fecha seleccionada en el título
            const selectedDateElement = document.getElementById('selectedDate');
            if (selectedDateElement) {
                selectedDateElement.innerHTML = formatDateForBadge(selectedDate);
                selectedDateElement.className = 'mb-0 text-muted fw-normal';
            }
            
            // Actualizar entradas del día seleccionado
            updateDailyEntries(selectedDate);
        });
    }
    
    return dayElement;
}

/**
 * Seleccionar entrada del día
 */
function selectEntry(entryElement) {
    // Remover selección anterior
    document.querySelectorAll('.entry-card.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Seleccionar entrada actual
    entryElement.classList.add('selected');
    
    // Obtener datos de la consulta
    const consultationId = entryElement.getAttribute('data-consultation-id');
    const patientId = entryElement.getAttribute('data-patient-id');
    const patientName = entryElement.querySelector('.entry-patient-name').textContent;
    
    console.log('Entrada seleccionada:', { consultationId, patientId, patientName });
    
    // Navegar al historial del paciente
    if (patientId) {
        window.location.href = `historial.html?id=${patientId}&name=${encodeURIComponent(patientName)}`;
    }
}

/**
 * Cargar todas las consultas
 */
async function loadAllConsultations() {
    try {
        console.log('🔄 Cargando todas las consultas...');
        
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token no encontrado. Usuario no autenticado.');
            window.location.href = 'login.html';
            return;
        }
        
        const response = await fetch('http://localhost:3000/api/consultations?limit=1000', {
            method: 'GET',
            headers: getAuthHeadersSafe()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const consultas = data.data && data.data.data ? data.data.data : [];
        
        appState.consultations = consultas;
        
        // Agrupar consultas por fecha
        appState.consultationsByDate = {};
        consultas.forEach(consulta => {
            if (consulta.fecha_historia) {
                // Extraer solo la parte de fecha (YYYY-MM-DD) sin preocuparse por la hora
                const fechaStr = consulta.fecha_historia.split('T')[0]; // "2025-07-14"
                
                console.log(`📅 Consulta ID ${consulta.id}: fecha_historia=${consulta.fecha_historia}, fechaKey=${fechaStr}`);
                
                if (!appState.consultationsByDate[fechaStr]) {
                    appState.consultationsByDate[fechaStr] = [];
                }
                appState.consultationsByDate[fechaStr].push(consulta);
            }
        });
        
        console.log(`✅ ${consultas.length} consultas cargadas`);
        console.log('📊 Consultas agrupadas por fecha:', appState.consultationsByDate);
        
        // Actualizar entradas del día actual
        const today = new Date();
        updateDailyEntries(today);
        
    } catch (error) {
        console.error('❌ Error cargando consultas:', error);
    }
}

/**
 * Actualizar entradas del día seleccionado
 */
function updateDailyEntries(date) {
    const dailyEntriesContainer = document.getElementById('dailyEntries');
    if (!dailyEntriesContainer) return;
    
    const fechaKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const consultasDelDia = appState.consultationsByDate[fechaKey] || [];
    
    console.log(`🗓️ Buscando entradas para fecha: ${fechaKey}`);
    console.log(`📋 Consultas encontradas: ${consultasDelDia.length}`);
    console.log('🔍 Todas las fechas disponibles:', Object.keys(appState.consultationsByDate));
    
    appState.selectedDate = date;
    
    // Limpiar contenedor
    dailyEntriesContainer.innerHTML = '';
    
    if (consultasDelDia.length === 0) {
        dailyEntriesContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calendar-x text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mb-0 mt-2">No hay historias clínicas registradas en este día</p>
            </div>
        `;
        return;
    }
    
    // Ordenar consultas por hora de creación
    consultasDelDia.sort((a, b) => {
        const fechaA = new Date(a.created_at);
        const fechaB = new Date(b.created_at);
        return fechaA.getTime() - fechaB.getTime();
    });
    
    // Crear tarjetas de consultas
    consultasDelDia.forEach(consulta => {
        const fecha = new Date(consulta.created_at);
        const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        // Buscar información del paciente
        const nombrePaciente = consulta.paciente_nombre || `Paciente ID: ${consulta.paciente_id}`;
        
        // Truncar historia para mostrar
        const historia = consulta.historia || 'Sin notas';
        const historiaCorta = historia.length > 100 ? historia.substring(0, 100) + '...' : historia;
        
        const entryCard = document.createElement('div');
        entryCard.className = 'entry-card mb-3';
        entryCard.onclick = () => selectEntry(entryCard);
        
        // Agregar data attributes para más funcionalidad
        entryCard.setAttribute('data-consultation-id', consulta.id);
        entryCard.setAttribute('data-patient-id', consulta.paciente_id);
        
        entryCard.innerHTML = `
            <div class="entry-patient-name">${nombrePaciente}</div>
            <div class="entry-time text-primary">${hora}</div>
            <div class="entry-description text-muted">${historiaCorta}</div>
            ${consulta.imagen ? '<div class="entry-attachment"><i class="bi bi-paperclip text-info"></i> Archivo adjunto</div>' : ''}
        `;
        
        dailyEntriesContainer.appendChild(entryCard);
    });
    
    console.log(`✅ ${consultasDelDia.length} entradas mostradas para ${fechaKey}`);
}

/**
 * Verificar si una fecha tiene eventos (consultas)
 */
function hasEventsOnDate(date) {
    const fechaKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return appState.consultationsByDate[fechaKey] && appState.consultationsByDate[fechaKey].length > 0;
}

/**
 * Cambiar mes del calendario
 */
function changeMonth(direction) {
    console.log('🔄 Cambiando mes, dirección:', direction);
    
    if (!appState.currentDate) {
        appState.currentDate = new Date();
    }
    
    // Cambiar mes
    appState.currentDate.setMonth(appState.currentDate.getMonth() + direction);
    console.log('📅 Nueva fecha:', appState.currentDate);
    
    // Actualizar display
    displayCalendar(appState.currentDate);
}

/**
 * Formatear fecha para mostrar en el badge
 */
function formatDateForBadge(date) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    return `<strong>${day} de ${months[month]} ${year}</strong>`;
}

/**
 * Seleccionar el día actual en el calendario
 */
function selectTodayInCalendar() {
    const today = new Date();
    const todayElements = document.querySelectorAll('.calendar-day.today');
    
    if (todayElements.length > 0) {
        todayElements[0].click();
    } else {
        // Si no hay elemento "today" visible, actualizar la fecha manualmente
        const selectedDateElement = document.getElementById('selectedDate');
        if (selectedDateElement) {
            selectedDateElement.innerHTML = formatDateForBadge(today);
            selectedDateElement.className = 'mb-0 text-muted fw-normal';
        }
        updateDailyEntries(today);
    }
}

/**
 * Buscar pacientes en la base de datos
 */
async function searchPatients(query) {
    console.log('🔍 Buscando pacientes:', query);
    
    const tableBody = document.getElementById('patientsTableBody');
    const countElement = document.getElementById('patientsCount');
    
    if (!tableBody) return;
    
    // Si no hay query, cargar todos los pacientes
    if (!query || query.trim().length === 0) {
        console.log('🔄 Query vacío, cargando todos los pacientes...');
        await loadPatients();
        return;
    }

    // Mostrar que está buscando
    tableBody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Buscando "${query}"...
            </td>
        </tr>
    `;
    
    if (countElement) countElement.textContent = 'Buscando...';
    
    try {
        // Verificar si es una búsqueda con palabras clave (contiene +)
        const hasKeywords = query.includes('+');
        
        if (hasKeywords) {
            console.log('🔍 Búsqueda con palabras clave detectada');
            await performKeywordSearch(query);
        } else {
            console.log('🔍 Búsqueda simple en backend');
            await performBackendSearch(query);
        }
        
    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        
        // Mostrar error en la tabla
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al buscar: ${error.message}
                </td>
            </tr>
        `;
        
        if (countElement) countElement.textContent = 'Error en búsqueda';
    }
}

// Nueva función para búsqueda con palabras clave
async function performKeywordSearch(query) {
    console.log('🔑 Realizando búsqueda con palabras clave:', query);
    
    const tableBody = document.getElementById('patientsTableBody');
    const countElement = document.getElementById('patientsCount');
    
    // Los pacientes ya están cargados en appState.allPatients
    if (!appState.allPatients || appState.allPatients.length === 0) {
        console.log('📥 No hay pacientes cargados, cargando primero...');
        await loadPatients(); // Esto cargará todos los pacientes
    }
    
    // Dividir query por '+' y limpiar espacios
    const keywords = query.toLowerCase().split('+').map(k => k.trim()).filter(k => k.length > 0);
    console.log('🔑 Palabras clave:', keywords);
    
    // Filtrar pacientes localmente
    const filteredPatients = appState.allPatients.filter(patient => {
        return keywords.every(keyword => {
            // Calcular edad para buscar por edad
            const birthDate = new Date(patient.nacimiento);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            
            // Crear un string con toda la información del paciente para buscar
            const searchText = [
                patient.nombre || '',
                patient.documento || '',
                patient.localidad || '',
                patient.obra_social || '',
                patient.importante || '',
                age.toString(),
                patient.sexo === 'M' ? 'masculino hombre m' : 
                patient.sexo === 'F' ? 'femenino mujer f' : '',
                // También buscar por años
                `${age} años`,
                `${age}años`,
                // Buscar por rango de edades comunes
                age >= 0 && age <= 12 ? 'niño niña infantil' :
                age >= 13 && age <= 17 ? 'adolescente joven' :
                age >= 18 && age <= 30 ? 'joven adulto' :
                age >= 31 && age <= 60 ? 'adulto' :
                age >= 61 ? 'mayor adulto anciano tercera edad' : ''
            ].join(' ').toLowerCase();
            
            return searchText.includes(keyword);
        });
    });
    
    console.log(`✅ Filtrado local completado: ${filteredPatients.length} resultados`);
    
    // Actualizar estado
    appState.patients = filteredPatients;
    appState.filteredPatients = filteredPatients;
    
    // Actualizar contador
    if (countElement) {
        if (filteredPatients.length === 0) {
            countElement.textContent = `Sin resultados para "${query}"`;
        } else if (filteredPatients.length === 1) {
            countElement.textContent = `1 resultado para "${query}"`;
        } else {
            countElement.textContent = `${filteredPatients.length} resultados para "${query}"`;
        }
    }
    
    // Renderizar resultados
    renderPatients(filteredPatients);
}

// Función para búsqueda simple en backend (búsqueda original)
async function performBackendSearch(query) {
    console.log('🌐 Realizando búsqueda en backend:', query);
    
    const tableBody = document.getElementById('patientsTableBody');
    const countElement = document.getElementById('patientsCount');
    
    // Obtener token de autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no encontrado. Usuario no autenticado.');
        window.location.href = 'login.html';
        return;
    }
    
    // Hacer búsqueda en el backend con autenticación
    const response = await fetch(`http://localhost:3000/api/patients?search=${encodeURIComponent(query.trim())}&limit=100`, {
        method: 'GET',
        headers: getAuthHeadersSafe()
    });
    
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📥 Resultados de búsqueda:', data);
    
    if (!data.success) {
        throw new Error(data.message || 'Error al buscar pacientes');
    }
    
    const patients = data.data.data || [];
    
    // Actualizar estado global
    appState.patients = patients;
    appState.filteredPatients = patients;
    
    // Actualizar contador
    if (countElement) {
        if (patients.length === 0) {
            countElement.textContent = `Sin resultados para "${query}"`;
        } else if (patients.length === 1) {
            countElement.textContent = `1 resultado para "${query}"`;
        } else {
            countElement.textContent = `${patients.length} resultados para "${query}"`;
        }
    }
    
    // Renderizar resultados
    renderPatients(patients);
    
    console.log(`✅ Búsqueda completada: ${patients.length} resultados para "${query}"`);
}

// Inicializar tooltips específicos (excluyendo el botón de perfil)
function initializeTooltips() {
    try {
        // Seleccionar solo elementos con tooltip que NO sean el botón de perfil
        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]:not(#profileDropdown)');
        
        tooltipElements.forEach(element => {
            new bootstrap.Tooltip(element);
        });
        
        console.log('✅ Tooltips inicializados (excluyendo perfil)');
    } catch (error) {
        console.warn('⚠️ Error inicializando tooltips:', error);
    }
}

// Llamar la inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que Bootstrap se cargue completamente
    setTimeout(initializeTooltips, 100);
});

/**
 * Verificar si hay actualizaciones de pacientes desde historial
 */
function checkPatientUpdates() {
    try {
        const updatedPatientId = localStorage.getItem('medilogs_patient_updated');
        const updateTimestamp = localStorage.getItem('medilogs_patient_updated_timestamp');
        
        if (updatedPatientId && updateTimestamp) {
            const timeDiff = Date.now() - parseInt(updateTimestamp);
            // Si la actualización fue hace menos de 30 segundos, recargar datos
            if (timeDiff < 30000) {
                console.log(`🔄 Detectada actualización del paciente ${updatedPatientId}, recargando datos...`);
                
                // Limpiar marcadores de actualización
                localStorage.removeItem('medilogs_patient_updated');
                localStorage.removeItem('medilogs_patient_updated_timestamp');
                
                // Marcar que necesita recarga
                appState.needsReload = true;
            }
        }
    } catch (error) {
        console.warn('⚠️ Error verificando actualizaciones:', error.message);
    }
}

/**
 * Mostrar notificación de actualización
 */
function showUpdateNotification() {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        <strong>Datos actualizados</strong>
        <br>Se detectaron cambios en las historias clínicas y se actualizó la tabla.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Configurar detección cuando la ventana vuelve a tener foco
 */
function setupWindowFocusDetection() {
    window.addEventListener('focus', function() {
        // Verificar actualizaciones cuando la ventana vuelve a tener foco
        checkPatientUpdates();
        
        // Si hay cambios pendientes y los datos ya están cargados, recargar
        if (appState.needsReload && appState.patients.length > 0) {
            console.log('🔄 Ventana en foco, recargando datos actualizados...');
            loadPatients();
            showUpdateNotification();
            appState.needsReload = false;
        }
    });

    // También verificar cada 10 segundos si hay actualizaciones
    setInterval(function() {
        checkPatientUpdates();
        if (appState.needsReload && appState.patients.length > 0) {
            console.log('🔄 Actualizaciones detectadas, recargando datos...');
            loadPatients();
            showUpdateNotification();
            appState.needsReload = false;
        }
    }, 10000); // Cada 10 segundos
}

/**
 * Mostrar tip rápido al usuario
 */
function showQuickTip(message) {
    // Evitar mostrar múltiples tips al mismo tiempo
    const existingTip = document.getElementById('quickTip');
    if (existingTip) {
        existingTip.remove();
    }
    
    const tip = document.createElement('div');
    tip.id = 'quickTip';
    tip.className = 'alert alert-info alert-dismissible fade show position-fixed';
    tip.style.cssText = `
        bottom: 20px; 
        right: 20px; 
        z-index: 9999; 
        min-width: 280px; 
        max-width: 400px;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    tip.innerHTML = `
        <i class="bi bi-info-circle me-2"></i>
        <strong>Tip:</strong> ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Close"></button>
    `;
    
    document.body.appendChild(tip);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (tip && tip.parentNode) {
            tip.classList.remove('show');
            setTimeout(() => tip.remove(), 150);
        }
    }, 4000);
}

/**
 * Mostrar negatoscopio
 */
function showNegatoscope() {
    console.log('🔍 Abriendo negatoscopio...');
    
    // Crear overlay fullscreen
    const negatoscopeOverlay = document.createElement('div');
    negatoscopeOverlay.id = 'negatoscopeOverlay';
    negatoscopeOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 9999;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Crear texto de instrucción
    const instructionText = document.createElement('div');
    instructionText.id = 'negatoscopeInstruction';
    instructionText.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(108, 117, 125, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    instructionText.textContent = 'Toca en cualquier lugar para cerrar';
    
    // Agregar al DOM
    document.body.appendChild(negatoscopeOverlay);
    document.body.appendChild(instructionText);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Cerrar al hacer click en cualquier parte
    negatoscopeOverlay.addEventListener('click', function() {
        closeNegatoscope();
    });
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeNegatoscope();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    // Función para cerrar el negatoscopio
    function closeNegatoscope() {
        const overlay = document.getElementById('negatoscopeOverlay');
        const instruction = document.getElementById('negatoscopeInstruction');
        
        if (overlay) {
            overlay.remove();
        }
        if (instruction) {
            instruction.remove();
        }
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        console.log('🔍 Negatoscopio cerrado');
    }
}

/**
 * Cerrar sesión
 */
function logout() {
    console.log('👋 Cerrando sesión...');
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('medicoId');
    localStorage.removeItem('editingPatient');
    localStorage.removeItem('medilogs_patient_updated');
    localStorage.removeItem('medilogs_patient_updated_timestamp');
    
    // Mostrar mensaje de despedida
    const userName = appState.user ? appState.user.nombre : 'Usuario';
    
    // Crear notificación de cierre de sesión
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        <strong>Hasta luego, ${userName}</strong>
        <br>Sesión cerrada correctamente
    `;
    
    document.body.appendChild(notification);
    
    // Redirigir al login después de mostrar el mensaje
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

/**
 * Alternar modo oscuro
 */
function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    body.classList.toggle('dark-mode');
    
    // Actualizar icono y texto
    if (body.classList.contains('dark-mode')) {
        if (darkModeIcon) darkModeIcon.className = 'bi bi-sun me-2';
        if (darkModeText) darkModeText.textContent = 'Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        if (darkModeIcon) darkModeIcon.className = 'bi bi-moon me-2';
        if (darkModeText) darkModeText.textContent = 'Modo Oscuro';
        localStorage.setItem('darkMode', 'disabled');
    }
    
    console.log('🌙 Modo oscuro:', body.classList.contains('dark-mode') ? 'activado' : 'desactivado');
}

/**
 * Mostrar información de la aplicación
 */
function showAppInfo() {
    console.log('ℹ️ Mostrando información de la aplicación...');
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'appInfoModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-info-circle me-2"></i>Acerca de MediLogs
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="bi bi-heart-pulse text-primary" style="font-size: 4rem;"></i>
                        <h3 class="mt-3">MediLogs</h3>
                        <p class="text-muted">Sistema de Gestión de Pacientes Médicos</p>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="bi bi-info-circle me-2"></i>Información del Sistema</h6>
                            <ul class="list-unstyled">
                                <li><strong>Versión:</strong> 3.0.0</li>
                                <li><strong>Desarrollado por:</strong> Equipo MediLogs</li>
                                <li><strong>Fecha:</strong> 2025</li>
                                <li><strong>Tecnología:</strong> JavaScript, Bootstrap 5, Node.js</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="bi bi-gear me-2"></i>Características</h6>
                            <ul class="list-unstyled">
                                <li>✅ Gestión de pacientes</li>
                                <li>✅ Historias clínicas</li>
                                <li>✅ Calendario médico</li>
                                <li>✅ Negatoscopio integrado</li>
                                <li>✅ Búsqueda avanzada</li>
                                <li>✅ Modo oscuro</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="text-center mt-4">
                        <p class="text-muted">
                            <i class="bi bi-shield-check me-2"></i>
                            Sistema seguro con autenticación JWT
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                        <i class="bi bi-check-lg me-2"></i>Entendido
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Limpiar modal cuando se cierre
    modal.addEventListener('hidden.bs.modal', function () {
        modal.remove();
    });
}

/**
 * Inicializar modo oscuro si estaba activado
 */
function initializeDarkMode() {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
    
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        const darkModeIcon = document.getElementById('darkModeIcon');
        const darkModeText = document.getElementById('darkModeText');
        
        if (darkModeIcon) darkModeIcon.className = 'bi bi-sun me-2';
        if (darkModeText) darkModeText.textContent = 'Modo Claro';
    }
}

// Inicializar modo oscuro al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDarkMode, 100);
});
