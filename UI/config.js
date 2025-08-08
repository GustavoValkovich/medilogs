// Configuración de la API para MediLogs UI
const API_CONFIG = {
    // URL base de la API del backend
    BASE_URL: 'http://localhost:3000',
    API_BASE_URL: 'http://localhost:3000/api',
    
    // Endpoints principales
    ENDPOINTS: {
        // Sistema
        HEALTH: '/health',
        API_INFO: '/api',
        
        // Autenticación
        AUTH: {
            LOGIN: '/api/auth/login',
            LOGOUT: '/api/auth/logout',
            REGISTER: '/api/auth/register',
            RESET_PASSWORD: '/api/auth/reset-password',
            RECOVER_USER: '/api/auth/recover-user',
            PROFILE: '/api/auth/profile'
        },
        
        // Pacientes
        PATIENTS: {
            BASE: '/api/patients',
            GET_ALL: '/api/patients',
            GET_BY_ID: '/api/patients/:id',
            CREATE: '/api/patients',
            UPDATE: '/api/patients/:id',
            DELETE: '/api/patients/:id',
            SEARCH: '/api/patients/search'
        },
        
        // Médicos
        DOCTORS: {
            BASE: '/api/doctors',
            GET_ALL: '/api/doctors',
            GET_BY_ID: '/api/doctors/:id',
            CREATE: '/api/doctors',
            UPDATE: '/api/doctors/:id',
            DELETE: '/api/doctors/:id'
        },
        
        // Consultas
        CONSULTATIONS: {
            BASE: '/api/consultations',
            GET_ALL: '/api/consultations',
            GET_BY_ID: '/api/consultations/:id',
            GET_BY_PATIENT: '/api/consultations/patient/:patientId',
            CREATE: '/api/consultations',
            UPDATE: '/api/consultations/:id',
            DELETE: '/api/consultations/:id'
        },
        
        // Archivos
        FILES: {
            UPLOAD: '/api/files/upload',
            DOWNLOAD: '/api/files/:filename',
            DELETE: '/api/files/:filename'
        },
        
        // Excel
        EXCEL: {
            EXPORT_PATIENTS: '/api/excel/patients/export',
            IMPORT_PATIENTS: '/api/excel/patients/import',
            EXPORT_CONSULTATIONS: '/api/excel/consultations/export',
            IMPORT_CONSULTATIONS: '/api/excel/consultations/import',
            TEMPLATES: '/api/excel/templates'
        }
    },
    
    // Configuración de headers por defecto
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Configuración de timeout
    TIMEOUT: 10000, // 10 segundos
    
    // Configuración de retry
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo
};

// Función para construir URLs completas
const buildUrl = (endpoint) => {
    if (endpoint.startsWith('/api/')) {
        return API_CONFIG.BASE_URL + endpoint;
    }
    return API_CONFIG.BASE_URL + API_CONFIG.API_BASE_URL + endpoint;
};

// Función para reemplazar parámetros en URLs
const replaceUrlParams = (url, params) => {
    let finalUrl = url;
    Object.keys(params).forEach(key => {
        finalUrl = finalUrl.replace(`:${key}`, params[key]);
    });
    return finalUrl;
};

// Función para obtener token de autenticación
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Función para configurar headers con autenticación
const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = { ...API_CONFIG.DEFAULT_HEADERS };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
    return !!getAuthToken();
};

// Función para logout
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('medilogs_remember');
    window.location.href = 'login.html';
};

// Exportar configuración para uso global
window.API_CONFIG = API_CONFIG;
window.buildUrl = buildUrl;
window.replaceUrlParams = replaceUrlParams;
window.getAuthToken = getAuthToken;
window.getAuthHeaders = getAuthHeaders;
window.isAuthenticated = isAuthenticated;
window.logout = logout;
