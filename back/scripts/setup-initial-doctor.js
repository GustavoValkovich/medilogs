#!/usr/bin/env node

/**
 * Script de configuración inicial para MediLogs
 * Este script ayuda a configurar el primer médico del sistema
 */

const readline = require('readline');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          reject(new Error(`Error parsing JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function checkSystemStatus() {
  try {
    const response = await makeRequest(`${API_BASE_URL}/doctors/system-status`);
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data.message}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al verificar el estado del sistema:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Asegúrese de que el servidor esté ejecutándose en el puerto 3000');
    }
    process.exit(1);
  }
}

async function createFirstDoctor() {
  console.log('\n🔧 Configuración inicial de MediLogs');
  console.log('=====================================\n');

  // Verificar estado del sistema
  const status = await checkSystemStatus();
  
  if (!status.data.needsInitialSetup) {
    console.log('✅ El sistema ya está configurado');
    console.log(`   Total de médicos: ${status.data.totalDoctors}`);
    console.log('\n💡 Use el endpoint de login para autenticarse:');
    console.log(`   POST ${API_BASE_URL}/auth/login`);
    process.exit(0);
  }

  console.log('⚠️  El sistema necesita configuración inicial');
  console.log('   Vamos a crear el primer médico del sistema\n');

  // Recopilar información del médico
  const doctorData = {};
  
  doctorData.nombre = await question('👤 Nombre: ');
  doctorData.apellido = await question('👤 Apellido: ');
  doctorData.email = await question('📧 Email: ');
  doctorData.password = await question('🔒 Contraseña: ');
  doctorData.especialidad = await question('🏥 Especialidad (opcional): ') || 'Medicina General';
  doctorData.telefono = await question('📞 Teléfono (opcional): ') || '';
  doctorData.matricula = await question('📜 Matrícula (opcional): ') || 'TEMP-001';

  console.log('\n🚀 Creando médico...');

  try {
    const response = await makeRequest(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      body: doctorData
    });
    
    if (response.status !== 201) {
      throw new Error(`HTTP ${response.status}: ${response.data.message}`);
    }

    console.log('✅ ¡Médico creado exitosamente!');
    console.log(`   ID: ${response.data.data.id}`);
    console.log(`   Nombre: ${response.data.data.nombre} ${response.data.data.apellido}`);
    console.log(`   Email: ${response.data.data.email}`);
    console.log(`   Especialidad: ${response.data.data.especialidad}`);
    
    console.log('\n🎉 El sistema está listo para usar');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Use el endpoint de login para autenticarse:');
    console.log(`      POST ${API_BASE_URL}/auth/login`);
    console.log('   2. Use el email y contraseña que acaba de crear');
    console.log('   3. Guarde el token JWT para futuras peticiones');
    
  } catch (error) {
    console.error('❌ Error al crear el médico:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await createFirstDoctor();
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { createFirstDoctor, checkSystemStatus };
