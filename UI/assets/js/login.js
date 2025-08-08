// LOGIN ULTRA-SIMPLIFICADO - SOLUCIÓN DEFINITIVA AL LOADING INFINITO

console.log('🚀 [ULTRA-SIMPLE] Cargando login ultra-simplificado...');

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 [ULTRA-SIMPLE] DOM cargado, configurando login...');
    
    // Event listener para el formulario
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleUltraSimpleLogin);
        console.log('✅ [ULTRA-SIMPLE] Event listener configurado');
    }
    
    // Auto-focus en username
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.focus();
    }
});

/**
 * Login ultra-simplificado - SIN COMPLEJIDADES
 */
async function handleUltraSimpleLogin(event) {
    event.preventDefault();
    console.log('🔑 [ULTRA-SIMPLE] Iniciando login ultra-simple...');
    
    // Obtener valores
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validación básica
    if (!username || !password) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    console.log('🔑 [ULTRA-SIMPLE] Credenciales obtenidas:', { username });
    
    // Mostrar loading
    showUltraSimpleLoading(true);
    
    try {
        // Mapear username a email
        const email = mapSimpleUsernameToEmail(username);
        console.log('📧 [ULTRA-SIMPLE] Email mapeado:', email);
        
        // Hacer petición directa
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log('📡 [ULTRA-SIMPLE] Respuesta del servidor:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ [ULTRA-SIMPLE] Login exitoso, datos:', data);
            
            // Guardar datos básicos
            localStorage.setItem('medilogs_token', 'ultra_simple_token_' + Date.now());
            
            if (data.data && data.data.medico) {
                localStorage.setItem('medilogs_user', JSON.stringify(data.data.medico));
                console.log('👤 [ULTRA-SIMPLE] Usuario guardado:', data.data.medico.nombre);
            }
            
            // REDIRECCIÓN INMEDIATA SIN DELAYS
            console.log('🎯 [ULTRA-SIMPLE] REDIRECCIÓN INMEDIATA...');
            
            const currentUrl = window.location.href;
            const dashboardUrl = currentUrl.replace('login.html', 'index.html');
            console.log('🎯 [ULTRA-SIMPLE] Redirigiendo AHORA a:', dashboardUrl);
            
            // Redirección inmediata
            window.location.href = dashboardUrl;
            
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Error de conexión' }));
            console.error('❌ [ULTRA-SIMPLE] Error del servidor:', response.status, errorData);
            alert('Error de login: ' + (errorData.message || 'Credenciales inválidas'));
        }
        
    } catch (error) {
        console.error('❌ [ULTRA-SIMPLE] Error de red:', error);
        alert('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
        showUltraSimpleLoading(false);
    }
}

/**
 * Mapeo simple de username a email
 */
function mapSimpleUsernameToEmail(username) {
    const mappings = {
        'DianaPacientes': 'diana.valkovich@medilogs.com',
        'diana': 'diana.valkovich@medilogs.com',
        'admin': 'admin@medilogs.com'
    };
    
    return mappings[username] || `${username}@medilogs.com`;
}

/**
 * Mostrar/ocultar loading ultra-simple
 */
function showUltraSimpleLoading(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn ? loginBtn.querySelector('.btn-text') : null;
    const btnSpinner = loginBtn ? loginBtn.querySelector('.spinner-border') : null;
    
    if (loading) {
        if (loginBtn) loginBtn.disabled = true;
        if (btnText) btnText.textContent = 'Iniciando sesión...';
        if (btnSpinner) btnSpinner.style.display = 'inline-block';
        console.log('⏳ [ULTRA-SIMPLE] Mostrando loading...');
    } else {
        if (loginBtn) loginBtn.disabled = false;
        if (btnText) btnText.textContent = 'Iniciar sesión';
        if (btnSpinner) btnSpinner.style.display = 'none';
        console.log('✅ [ULTRA-SIMPLE] Ocultando loading...');
    }
}

/**
 * Mostrar mensaje de éxito ultra-simple
 */
function showUltraSimpleSuccess() {
    const alertContainer = document.getElementById('alertContainer') || document.body;
    
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x';
    successDiv.style.zIndex = '9999';
    successDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
            <strong>¡Login exitoso! Redirigiendo...</strong>
        </div>
    `;
    
    alertContainer.appendChild(successDiv);
    console.log('🎉 [ULTRA-SIMPLE] Mensaje de éxito mostrado');
}

// Función global para testing manual
window.testUltraSimpleLogin = function() {
    console.log('🧪 [ULTRA-SIMPLE] Test manual del login:');
    console.log('  - Token:', localStorage.getItem('medilogs_token'));
    console.log('  - Usuario:', localStorage.getItem('medilogs_user'));
};

// Función para redirección manual de emergencia
window.goToDashboardNow = function() {
    console.log('🚨 [ULTRA-SIMPLE] Redirección manual de emergencia...');
    const currentUrl = window.location.href;
    const dashboardUrl = currentUrl.replace('login.html', 'index.html');
    window.location.href = dashboardUrl;
};

console.log('✅ [ULTRA-SIMPLE] Login ultra-simplificado cargado');
console.log('💡 [ULTRA-SIMPLE] Funciones disponibles: testUltraSimpleLogin(), goToDashboardNow()');
