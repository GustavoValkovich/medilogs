// Funciones API para MediLogs UI

/**
 * Clase para manejar las peticiones HTTP a la API
 */
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.apiBaseURL = API_CONFIG.API_BASE_URL;
        this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    /**
     * Método genérico para hacer peticiones HTTP
     */
    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                ...this.defaultHeaders,
                ...getAuthHeaders(), // Agregar headers de autenticación automáticamente
                ...options.headers
            },
            ...options
        };

        // Agregar body si existe y no es GET
        if (options.body && config.method !== 'GET') {
            if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
                config.body = JSON.stringify(options.body);
            } else {
                config.body = options.body;
                // Para FormData, eliminar Content-Type para que el browser lo configure automáticamente
                if (options.body instanceof FormData) {
                    delete config.headers['Content-Type'];
                }
            }
        }

        try {
            console.log(`🌐 API Request: ${config.method} ${url}`);
            
            const response = await fetch(url, config);
            
            // Manejar token expirado
            if (response.status === 401 && isAuthenticated()) {
                console.log('🔑 Token expirado, redirigiendo al login...');
                logout();
                return;
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new APIError(
                    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    errorData
                );
            }

            // Verificar si la respuesta tiene contenido
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            
            console.error('❌ API Error:', error);
            throw new APIError(
                error.message || 'Error de conexión con el servidor',
                0,
                error
            );
        }
    }

    // Métodos de conveniencia para HTTP verbs
    async get(endpoint, params = {}) {
        const url = new URL(this.baseURL + endpoint);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        return this.request(url.pathname + url.search);
    }

    async post(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data,
            ...options
        });
    }

    async put(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data,
            ...options
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options
        });
    }
}

/**
 * Clase personalizada para errores de API
 */
class APIError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Instancia global del cliente API
 */
const apiClient = new APIClient();

/**
 * FUNCIONES ESPECÍFICAS PARA CADA MÓDULO
 */

// ==================== SISTEMA ====================
const SystemAPI = {
    async healthCheck() {
        return apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
    },

    async getAPIInfo() {
        return apiClient.get(API_CONFIG.ENDPOINTS.API_INFO);
    }
};

// ==================== PACIENTES ====================
const PatientsAPI = {
    async getAll(params = {}) {
        return apiClient.get(API_CONFIG.ENDPOINTS.PATIENTS.GET_ALL, params);
    },

    async getById(id) {
        const endpoint = API_CONFIG.ENDPOINTS.PATIENTS.GET_BY_ID.replace(':id', id);
        return apiClient.get(endpoint);
    },

    async create(patientData) {
        return apiClient.post(API_CONFIG.ENDPOINTS.PATIENTS.CREATE, patientData);
    },

    async update(id, patientData) {
        const endpoint = API_CONFIG.ENDPOINTS.PATIENTS.UPDATE.replace(':id', id);
        return apiClient.put(endpoint, patientData);
    },

    async delete(id) {
        const endpoint = API_CONFIG.ENDPOINTS.PATIENTS.DELETE.replace(':id', id);
        return apiClient.delete(endpoint);
    },

    async search(query) {
        return apiClient.get(API_CONFIG.ENDPOINTS.PATIENTS.SEARCH, { q: query });
    }
};

// ==================== MÉDICOS ====================
const DoctorsAPI = {
    async getAll(params = {}) {
        return apiClient.get(API_CONFIG.ENDPOINTS.DOCTORS.GET_ALL, params);
    },

    async getById(id) {
        const endpoint = API_CONFIG.ENDPOINTS.DOCTORS.GET_BY_ID.replace(':id', id);
        return apiClient.get(endpoint);
    },

    async create(doctorData) {
        return apiClient.post(API_CONFIG.ENDPOINTS.DOCTORS.CREATE, doctorData);
    },

    async update(id, doctorData) {
        const endpoint = API_CONFIG.ENDPOINTS.DOCTORS.UPDATE.replace(':id', id);
        return apiClient.put(endpoint, doctorData);
    },

    async delete(id) {
        const endpoint = API_CONFIG.ENDPOINTS.DOCTORS.DELETE.replace(':id', id);
        return apiClient.delete(endpoint);
    }
};

// ==================== CONSULTAS ====================
const ConsultationsAPI = {
    async getAll(params = {}) {
        return apiClient.get(API_CONFIG.ENDPOINTS.CONSULTATIONS.GET_ALL, params);
    },

    async getById(id) {
        const endpoint = API_CONFIG.ENDPOINTS.CONSULTATIONS.GET_BY_ID.replace(':id', id);
        return apiClient.get(endpoint);
    },

    async getByPatientId(patientId) {
        const endpoint = API_CONFIG.ENDPOINTS.CONSULTATIONS.GET_BY_PATIENT.replace(':patientId', patientId);
        return apiClient.get(endpoint);
    },

    async create(consultationData) {
        return apiClient.post(API_CONFIG.ENDPOINTS.CONSULTATIONS.CREATE, consultationData);
    },

    async update(id, consultationData) {
        const endpoint = API_CONFIG.ENDPOINTS.CONSULTATIONS.UPDATE.replace(':id', id);
        return apiClient.put(endpoint, consultationData);
    },

    async delete(id) {
        const endpoint = API_CONFIG.ENDPOINTS.CONSULTATIONS.DELETE.replace(':id', id);
        return apiClient.delete(endpoint);
    }
};

// ==================== ARCHIVOS ====================
const FilesAPI = {
    async upload(file, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Agregar metadata adicional
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        return apiClient.post(API_CONFIG.ENDPOINTS.FILES.UPLOAD, formData);
    },

    getDownloadUrl(filename) {
        return API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.FILES.DOWNLOAD.replace(':filename', filename);
    },

    async delete(filename) {
        const endpoint = API_CONFIG.ENDPOINTS.FILES.DELETE.replace(':filename', filename);
        return apiClient.delete(endpoint);
    }
};

// ==================== EXCEL ====================
const ExcelAPI = {
    async exportPatients(params = {}) {
        return apiClient.get(API_CONFIG.ENDPOINTS.EXCEL.EXPORT_PATIENTS, params);
    },

    async importPatients(file) {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(API_CONFIG.ENDPOINTS.EXCEL.IMPORT_PATIENTS, formData);
    },

    async exportConsultations(params = {}) {
        return apiClient.get(API_CONFIG.ENDPOINTS.EXCEL.EXPORT_CONSULTATIONS, params);
    },

    async importConsultations(file) {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(API_CONFIG.ENDPOINTS.EXCEL.IMPORT_CONSULTATIONS, formData);
    },

    async getTemplates() {
        return apiClient.get(API_CONFIG.ENDPOINTS.EXCEL.TEMPLATES);
    }
};

// ==================== AUTENTICACIÓN ====================
const AuthAPI = {
    async login(credentials) {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    },

    async logout() {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    },

    async register(userData) {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    },

    async resetPassword(data) {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, data);
    },

    async recoverUser(data) {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RECOVER_USER, data);
    },

    async getProfile() {
        // Función deshabilitada temporalmente - endpoint no implementado
        console.warn('⚠️ getProfile() deshabilitado - endpoint /api/auth/profile no implementado');
        return { 
            success: false, 
            error: 'Endpoint no implementado',
            message: 'La función getProfile está temporalmente deshabilitada'
        };
    }
};

// Exportar APIs para uso global
window.SystemAPI = SystemAPI;
window.PatientsAPI = PatientsAPI;
window.DoctorsAPI = DoctorsAPI;
window.ConsultationsAPI = ConsultationsAPI;
window.FilesAPI = FilesAPI;
window.ExcelAPI = ExcelAPI;
window.AuthAPI = AuthAPI;
window.APIClient = APIClient;
window.APIError = APIError;
