// JavaScript para Historia Clínica - MediLogs

// Estado global para historial
let historialState = {
    patientId: null,
    patientName: '',
    patientData: null,
    consultations: [],
    loading: false,
    selectedFile: null
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('🏥 Iniciando Historia Clínica...');
    
    // Obtener ID del paciente desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    const patientName = urlParams.get('name');
    
    if (patientId) {
        historialState.patientId = patientId;
        historialState.patientName = patientName || 'Paciente';
        
        // Actualizar nombre en el título
        document.getElementById('patientName').textContent = historialState.patientName;
        
        // Cargar historias clínicas
        loadPatientHistory();
        
        // Cargar información del paciente
        loadPatientInfo();
    } else {
        console.error('❌ No se proporcionó ID de paciente');
        alert('Error: No se pudo cargar la información del paciente');
        goBack();
    }
    
    // Inicializar funcionalidad
    initializeHistoryFunctionality();
    
    console.log('✅ Historia Clínica iniciada');
});

/**
 * Cargar historias clínicas del paciente
 */
async function loadPatientHistory() {
    const tableBody = document.getElementById('historyTableBody');
    
    if (!tableBody) return;
    
    // Mostrar spinner
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Cargando historias clínicas...
            </td>
        </tr>
    `;
    
    try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token no encontrado. Usuario no autenticado.');
            window.location.href = 'login.html';
            return;
        }
        
        const response = await fetch(`http://localhost:3000/api/consultations/by-patient/${historialState.patientId}`, {
            method: 'GET',
            headers: getAuthHeadersSafe()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const consultations = data.data || [];
        
        historialState.consultations = consultations;
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        if (consultations.length > 0) {
            renderConsultations(consultations);
            console.log(`✅ ${consultations.length} historias clínicas cargadas`);
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        <i class="bi bi-info-circle me-2"></i>
                        Paciente sin historial registrado
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        console.error('❌ Error cargando historias:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar historias: ${error.message}
                </td>
            </tr>
        `;
    }
}

/**
 * Cargar información completa del paciente
 */
async function loadPatientInfo() {
    try {
        console.log('👤 [PACIENTE] Cargando información del paciente...');
        
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token no encontrado. Usuario no autenticado.');
            window.location.href = 'login.html';
            return;
        }
        
        const response = await fetch(`http://localhost:3000/api/patients/${historialState.patientId}`, {
            method: 'GET',
            headers: getAuthHeadersSafe()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            historialState.patientData = result.data;
            
            console.log('✅ [PACIENTE] Información cargada:', result.data);
            
            // Verificar si tiene información importante
            if (result.data.importante && result.data.importante.trim()) {
                showImportantInfoButton();
            }
            
        } else {
            console.warn('⚠️ [PACIENTE] No se pudo cargar la información del paciente');
        }
        
    } catch (error) {
        console.error('❌ Error cargando información del paciente:', error);
    }
}

/**
 * Mostrar el botón de información importante
 */
function showImportantInfoButton() {
    const importantBtn = document.getElementById('importantInfoBtn');
    if (importantBtn) {
        importantBtn.classList.remove('d-none');
        
        // Agregar event listener
        importantBtn.addEventListener('click', showImportantInfoModal);
        
        console.log('⚠️ [INFO] Botón de información importante activado');
    }
}

/**
 * Mostrar modal con información importante
 */
function showImportantInfoModal() {
    if (!historialState.patientData) {
        console.warn('⚠️ No hay datos del paciente disponibles');
        return;
    }
    
    const modal = document.getElementById('importantInfoModal');
    const patientName = document.getElementById('modalPatientName');
    const patientDoc = document.getElementById('modalPatientDoc');
    const importantContent = document.getElementById('importantInfoContent');
    
    // Llenar datos del modal
    patientName.textContent = historialState.patientData.nombre || 'N/A';
    patientDoc.textContent = historialState.patientData.documento || 'N/A';
    
    // Mostrar información importante con formato
    const importantes = historialState.patientData.importante || 'Sin información importante registrada';
    importantContent.innerHTML = `<p class="mb-0">${importantes.replace(/\n/g, '<br>')}</p>`;
    
    // Mostrar modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    console.log('📋 [INFO] Modal de información importante mostrado');
}

/**
 * Renderizar consultas en la tabla
 */
function renderConsultations(consultations) {
    const tableBody = document.getElementById('historyTableBody');
    
    consultations.forEach(consultation => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        
        // Formatear fecha y hora
        // Usar fecha_historia para la fecha (solo día/mes/año)
        const fechaHistoria = new Date(consultation.fecha_historia);
        const fecha = fechaHistoria.toLocaleDateString('es-ES');
        
        // Usar created_at para la hora real de creación de la consulta
        const fechaCreacion = new Date(consultation.created_at);
        const hora = fechaCreacion.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Preparar historia/notas - usando campo 'historia' del backend
        const historia = consultation.historia || 'Sin notas';
        const historiaDisplay = historia.length > 50 ? historia.substring(0, 50) + '...' : historia;
        
        // Preparar adjunto - usando campo 'imagen' del backend
        let adjunto = '<span class="text-muted">Sin adjunto</span>';
        if (consultation.imagen) {
            let imagenUrl = consultation.imagen;
            
            // Manejar casos donde imagen podría ser un JSON array (datos antiguos)
            if (imagenUrl.startsWith('[') || imagenUrl.startsWith('{')) {
                try {
                    const parsedImages = JSON.parse(imagenUrl);
                    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                        // Tomar la primera imagen del array y extraer solo el nombre del archivo
                        imagenUrl = parsedImages[0].replace('/uploads/', '');
                    }
                } catch (e) {
                    console.warn('Error parsing imagen JSON:', e);
                    imagenUrl = consultation.imagen;
                }
            }
            
            adjunto = `<a href="http://localhost:3000/uploads/${imagenUrl}" target="_blank" class="attachment-link">
                <i class="bi bi-file-earmark"></i> Ver archivo
            </a>`;
        }
        
        row.innerHTML = `
            <td>${fecha}</td>
            <td>${hora}</td>
            <td title="${historia}">${historiaDisplay}</td>
            <td>${adjunto}</td>
        `;
        
        // Agregar event listener para expandir notas al hacer clic
        row.addEventListener('click', () => {
            showConsultationDetails(consultation);
        });
        
        tableBody.appendChild(row);
    });
}

/**
 * Inicializar funcionalidad del historial
 */
function initializeHistoryFunctionality() {
    // Establecer fecha y hora actual
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    document.getElementById('entryDate').value = today;
    document.getElementById('entryTime').value = currentTime;
    
    // Configurar botón de subir archivo
    const uploadBtn = document.getElementById('uploadFileBtn');
    const fileInput = document.getElementById('attachmentFile');
    const cameraBtn = document.getElementById('cameraBtn');
    const createEntryBtn = document.getElementById('createEntryBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const removeFileBtn = document.getElementById('removeFileBtn');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    if (cameraBtn) {
        cameraBtn.addEventListener('click', handleCameraCapture);
    }
    
    if (createEntryBtn) {
        createEntryBtn.addEventListener('click', handleCreateEntry);
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', handleDownloadPDF);
    }
    
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', handleRemoveFile);
    }
}

/**
 * Manejar selección de archivo
 */
function handleFileSelection(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Validar tamaño (5MB = 5242880 bytes)
        if (file.size > 5242880) {
            showPopupMessage('El archivo es demasiado grande. El tamaño máximo es 5 MB.', 'error');
            event.target.value = '';
            return;
        }
        
        // Validar tipo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            showPopupMessage('Tipo de archivo no permitido. Solo se permiten JPG, PNG y PDF.', 'error');
            event.target.value = '';
            return;
        }
        
        historialState.selectedFile = file;
        showSelectedFile(file.name);
    }
}

/**
 * Mostrar archivo seleccionado
 */
function showSelectedFile(fileName) {
    const fileInfo = document.getElementById('selectedFileInfo');
    const fileNameSpan = document.getElementById('fileName');
    
    if (fileInfo && fileNameSpan) {
        fileNameSpan.textContent = fileName;
        fileInfo.style.display = 'block';
    }
}

/**
 * Remover archivo seleccionado
 */
function handleRemoveFile() {
    historialState.selectedFile = null;
    document.getElementById('attachmentFile').value = '';
    document.getElementById('selectedFileInfo').style.display = 'none';
}

/**
 * Manejar captura de cámara
 */
function handleCameraCapture() {
    // Verificar si la API de MediaDevices está disponible
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Intentar usar la cámara del dispositivo
        openCameraModal();
    } else {
        // Fallback: usar input file con capture
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Usar cámara trasera
        
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                // Validar tamaño
                if (file.size > 5242880) {
                    showPopupMessage('Error: El archivo es demasiado grande. El tamaño máximo es 5 MB.', 'error');
                    return;
                }
                
                historialState.selectedFile = file;
                showSelectedFile(file.name);
            }
        });
        
        input.click();
    }
}

/**
 * Abrir modal de cámara
 */
function openCameraModal() {
    // Crear modal de cámara
    const modalHtml = `
        <div class="modal fade" id="cameraModal" tabindex="-1" aria-labelledby="cameraModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cameraModalLabel">
                            <i class="bi bi-camera me-2"></i>
                            Capturar Imagen
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div id="cameraContainer">
                            <video id="cameraVideo" autoplay playsinline style="width: 100%; max-width: 400px; border-radius: 8px;"></video>
                            <canvas id="cameraCanvas" style="display: none;"></canvas>
                        </div>
                        <div id="cameraPreview" style="display: none;">
                            <img id="capturedImage" style="width: 100%; max-width: 400px; border-radius: 8px;">
                        </div>
                        <div class="mt-3">
                            <button id="captureBtn" class="btn btn-primary me-2">
                                <i class="bi bi-camera-fill"></i> Capturar
                            </button>
                            <button id="retakeBtn" class="btn btn-secondary me-2" style="display: none;">
                                <i class="bi bi-arrow-counterclockwise"></i> Repetir
                            </button>
                            <button id="useCaptureBtn" class="btn btn-success" style="display: none;">
                                <i class="bi bi-check-circle"></i> Usar esta imagen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('cameraModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('cameraModal'));
    modal.show();
    
    // Iniciar cámara cuando se abre el modal
    document.getElementById('cameraModal').addEventListener('shown.bs.modal', startCamera);
    
    // Limpiar recursos cuando se cierra el modal
    document.getElementById('cameraModal').addEventListener('hidden.bs.modal', function () {
        stopCamera();
        this.remove();
    });
}

/**
 * Iniciar cámara
 */
async function startCamera() {
    const video = document.getElementById('cameraVideo');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const useCaptureBtn = document.getElementById('useCaptureBtn');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment' // Preferir cámara trasera
            }
        });
        
        video.srcObject = stream;
        window.currentCameraStream = stream;
        
        // Configurar botones
        captureBtn.onclick = captureImage;
        retakeBtn.onclick = retakeImage;
        useCaptureBtn.onclick = useCapturedImage;
        
    } catch (error) {
        console.error('Error accediendo a la cámara:', error);
        showPopupMessage('Error: No se pudo acceder a la cámara. Verifique los permisos.', 'error');
        
        // Cerrar modal y usar fallback
        const modal = bootstrap.Modal.getInstance(document.getElementById('cameraModal'));
        modal.hide();
        
        // Usar input file como fallback
        setTimeout(() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            
            input.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    if (file.size > 5242880) {
                        showPopupMessage('Error: El archivo es demasiado grande. El tamaño máximo es 5 MB.', 'error');
                        return;
                    }
                    historialState.selectedFile = file;
                    showSelectedFile(file.name);
                }
            });
            
            input.click();
        }, 500);
    }
}

/**
 * Capturar imagen
 */
function captureImage() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const preview = document.getElementById('cameraPreview');
    const capturedImage = document.getElementById('capturedImage');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const useCaptureBtn = document.getElementById('useCaptureBtn');
    
    // Configurar canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar frame actual del video en el canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convertir a imagen con compresión
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Reducir calidad para menor tamaño
    capturedImage.src = imageDataUrl;
    
    // Mostrar preview y ocultar video
    document.getElementById('cameraContainer').style.display = 'none';
    preview.style.display = 'block';
    
    // Actualizar botones
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-block';
    useCaptureBtn.style.display = 'inline-block';
    
    // Guardar imagen capturada
    window.capturedImageData = imageDataUrl;
}

/**
 * Repetir captura
 */
function retakeImage() {
    const preview = document.getElementById('cameraPreview');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const useCaptureBtn = document.getElementById('useCaptureBtn');
    
    // Mostrar video y ocultar preview
    document.getElementById('cameraContainer').style.display = 'block';
    preview.style.display = 'none';
    
    // Actualizar botones
    captureBtn.style.display = 'inline-block';
    retakeBtn.style.display = 'none';
    useCaptureBtn.style.display = 'none';
    
    // Limpiar imagen capturada
    window.capturedImageData = null;
}

/**
 * Usar imagen capturada
 */
function useCapturedImage() {
    if (window.capturedImageData) {
        // Convertir dataURL a File
        const byteString = atob(window.capturedImageData.split(',')[1]);
        const mimeString = window.capturedImageData.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        console.log('Archivo de cámara creado:', {
            name: file.name,
            size: file.size,
            type: file.type,
            sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        });
        
        // Validar tamaño
        if (file.size > 5242880) {
            showPopupMessage('Error: La imagen capturada es demasiado grande. Intente con menor resolución.', 'error');
            return;
        }
        
        // Usar archivo
        historialState.selectedFile = file;
        showSelectedFile(file.name);
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cameraModal'));
        modal.hide();
        
        showPopupMessage('Imagen capturada exitosamente.', 'success');
    }
}

/**
 * Detener cámara
 */
function stopCamera() {
    if (window.currentCameraStream) {
        window.currentCameraStream.getTracks().forEach(track => track.stop());
        window.currentCameraStream = null;
    }
    window.capturedImageData = null;
}

/**
 * Crear nueva entrada
 */
async function handleCreateEntry() {
    const date = document.getElementById('entryDate').value;
    const time = document.getElementById('entryTime').value;
    const notes = document.getElementById('clinicalNotes').value.trim();
    
    // Validar campos requeridos
    if (!date || !time || !notes) {
        showPopupMessage('Error: Por favor complete todos los campos obligatorios (fecha, hora y notas).', 'error');
        return;
    }
    
    // Validar tamaño de archivo si hay uno seleccionado
    if (historialState.selectedFile && historialState.selectedFile.size > 5242880) {
        showPopupMessage('Error: El archivo es demasiado grande. El tamaño máximo es 5 MB.', 'error');
        return;
    }
    
    const createBtn = document.getElementById('createEntryBtn');
    const originalText = createBtn.innerHTML;
    
    try {
        // Mostrar loading
        createBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando...';
        createBtn.disabled = true;
        
        // Combinar fecha y hora en un solo timestamp
        const fechaHoraCompleta = `${date}T${time}:00`;
        console.log('Fecha y hora combinadas:', fechaHoraCompleta);
        
        // Preparar datos según endpoint /api/consultations/with-files o /api/consultations
        if (historialState.selectedFile) {
            // Usar endpoint con archivos
            console.log('Creando consulta con archivo:', {
                size: historialState.selectedFile.size,
                type: historialState.selectedFile.type,
                name: historialState.selectedFile.name,
                fechaHora: fechaHoraCompleta
            });
            
            const formData = new FormData();
            // Obtener token de autenticación
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token no encontrado. Usuario no autenticado.');
                window.location.href = 'login.html';
                return;
            }
            
            formData.append('paciente_id', historialState.patientId);
            formData.append('fecha_historia', fechaHoraCompleta);
            formData.append('historia', notes);
            formData.append('files', historialState.selectedFile);
            
            const response = await fetch('http://localhost:3000/api/consultations/with-files', {
                method: 'POST',
                headers: getAuthHeadersSafe({ isFormData: true }),
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText };
                }
                
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            showPopupMessage('✅ Historia clínica creada exitosamente con archivo adjunto.', 'success');
            
        } else {
            // Obtener token de autenticación
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token no encontrado. Usuario no autenticado.');
                window.location.href = 'login.html';
                return;
            }
            
            // Usar endpoint simple
            const response = await fetch('http://localhost:3000/api/consultations', {
                method: 'POST',
                headers: getAuthHeadersSafe(),
                body: JSON.stringify({
                    paciente_id: parseInt(historialState.patientId),
                    fecha_historia: fechaHoraCompleta,
                    historia: notes
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            showPopupMessage('✅ Historia clínica creada exitosamente.', 'success');
        }
        
        // Limpiar formulario
        document.getElementById('clinicalNotes').value = '';
        historialState.selectedFile = null;
        document.getElementById('attachmentFile').value = '';
        document.getElementById('selectedFileInfo').style.display = 'none';
        
        // Marcar que se actualizaron las historias para actualizar el índice
        localStorage.setItem('medilogs_patient_updated', historialState.patientId);
        localStorage.setItem('medilogs_patient_updated_timestamp', Date.now().toString());
        
        // Recargar historias
        await loadPatientHistory();
        
    } catch (error) {
        console.error('❌ Error creando entrada:', error);
        showPopupMessage(`Error al crear historia clínica: ${error.message}`, 'error');
        
    } finally {
        // Restaurar botón
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
    }
}

/**
 * Descargar PDF
 */
async function handleDownloadPDF() {
    if (historialState.consultations.length === 0) {
        showPopupMessage('No hay registros para descargar.', 'warning');
        return;
    }
    
    const downloadBtn = document.getElementById('downloadPdfBtn');
    const originalText = downloadBtn.innerHTML;
    
    try {
        // Mostrar loading
        downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando PDF...';
        downloadBtn.disabled = true;
        
        console.log('🔄 Iniciando descarga de PDF para paciente:', historialState.patientId);
        
        const response = await fetch(`http://localhost:3000/api/consultations/patient/${historialState.patientId}/pdf`, {
            method: 'GET',
            headers: {
                ...getAuthHeadersSafe(),
                'Accept': 'application/pdf'
            }
        });
        
        console.log('📡 Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en respuesta:', { status: response.status, error: errorText });
            throw new Error(`Error del servidor (${response.status}): ${errorText}`);
        }
        
        // Verificar que la respuesta es realmente un PDF
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
            console.warn('⚠️ Tipo de contenido inesperado:', contentType);
        }
        
        const blob = await response.blob();
        console.log('📄 Blob creado:', {
            size: blob.size,
            type: blob.type
        });
        
        if (blob.size === 0) {
            throw new Error('El archivo PDF está vacío');
        }
        
        // Crear URL y descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Nombre del archivo mejorado
        const sanitizedName = historialState.patientName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `historial_${sanitizedName}_${timestamp}.pdf`;
        
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Limpiar recursos
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
        
        console.log('✅ PDF descargado exitosamente:', filename);
        showPopupMessage(`PDF descargado: ${filename}`, 'success');
        
    } catch (error) {
        console.error('❌ Error descargando PDF:', error);
        
        let errorMessage = 'Error desconocido al generar el PDF';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        // Mensajes de error más específicos
        if (errorMessage.includes('Failed to fetch')) {
            errorMessage = 'No se pudo conectar con el servidor. Verifique que esté funcionando.';
        } else if (errorMessage.includes('404')) {
            errorMessage = 'No se encontraron consultas para este paciente.';
        } else if (errorMessage.includes('500')) {
            errorMessage = 'Error interno del servidor al generar el PDF.';
        }
        
        showPopupMessage(`Error al descargar PDF: ${errorMessage}`, 'error');
    } finally {
        // Restaurar botón
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

/**
 * Mostrar detalles completos de una consulta
 */
function showConsultationDetails(consultation) {
    const fecha = new Date(consultation.fecha_historia).toLocaleDateString('es-ES');
    const hora = new Date(consultation.created_at).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const modalHtml = `
        <div class="modal fade" id="consultationModal" tabindex="-1" aria-labelledby="consultationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="consultationModalLabel">
                            <i class="bi bi-journal-medical me-2"></i>
                            Consulta del ${fecha} - ${hora}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Historia Clínica:</label>
                            <div class="p-3 bg-light rounded">
                                ${consultation.historia || 'Sin notas registradas'}
                            </div>
                        </div>
                        ${consultation.imagen ? (() => {
                            let imagenUrl = consultation.imagen;
                            let fileName = imagenUrl;
                            
                            // Manejar casos donde imagen podría ser un JSON array (datos antiguos)
                            if (imagenUrl.startsWith('[') || imagenUrl.startsWith('{')) {
                                try {
                                    const parsedImages = JSON.parse(imagenUrl);
                                    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                                        // Tomar la primera imagen del array
                                        const fullPath = parsedImages[0];
                                        imagenUrl = fullPath.replace('/uploads/', '');
                                        fileName = imagenUrl;
                                    }
                                } catch (e) {
                                    console.warn('Error parsing imagen JSON:', e);
                                    imagenUrl = consultation.imagen;
                                    fileName = imagenUrl;
                                }
                            }
                            
                            return `
                            <div class="mb-3">
                                <label class="form-label fw-bold">Archivo Adjunto:</label>
                                <div>
                                    <a href="http://localhost:3000/uploads/${imagenUrl}" 
                                       target="_blank" 
                                       class="btn btn-outline-primary">
                                        <i class="bi bi-file-earmark me-2"></i>
                                        Ver archivo: ${fileName}
                                    </a>
                                </div>
                            </div>`;
                        })() : ''}
                        <div class="mb-3">
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                ID de consulta: ${consultation.id}
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('consultationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('consultationModal'));
    modal.show();
    
    // Limpiar modal del DOM cuando se cierre
    document.getElementById('consultationModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

/**
 * Mostrar mensaje popup (reemplaza alerts)
 */
function showPopupMessage(message, type = 'info') {
    // Remover popup anterior si existe
    const existingPopup = document.getElementById('messagePopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    const alertClass = type === 'error' ? 'alert-danger' : 
                     type === 'success' ? 'alert-success' : 
                     'alert-info';
    
    const icon = type === 'error' ? 'bi-exclamation-triangle' :
                type === 'success' ? 'bi-check-circle' :
                'bi-info-circle';
    
    const popupHtml = `
        <div class="modal fade" id="messagePopup" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body p-0">
                        <div class="alert ${alertClass} m-0 rounded-0" role="alert">
                            <div class="d-flex align-items-center">
                                <i class="bi ${icon} fs-4 me-3"></i>
                                <div class="flex-grow-1">${message}</div>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('messagePopup'));
    modal.show();
    
    // Auto-cerrar después de 5 segundos para mensajes de éxito
    if (type === 'success') {
        setTimeout(() => {
            modal.hide();
        }, 5000);
    }
    
    // Limpiar del DOM cuando se cierre
    document.getElementById('messagePopup').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

/**
 * Función global para volver atrás
 */
function goBack() {
    window.history.back();
}

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

// Verificación de disponibilidad de funciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Verificando disponibilidad de funciones...');
    
    // Verificar si getAuthHeaders está disponible
    if (typeof getAuthHeaders === 'function') {
        console.log('✅ getAuthHeaders disponible');
    } else {
        console.log('⚠️ getAuthHeaders no disponible, usando fallback');
    }
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    if (token) {
        console.log('✅ Token encontrado en localStorage');
    } else {
        console.log('⚠️ No hay token en localStorage');
    }
});
