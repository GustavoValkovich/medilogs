#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

// Colores para output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function printColored(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execPromise(command, options = {}) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

async function checkDocker() {
    printColored('blue', '🔍 Verificando Docker...');
    try {
        await execPromise('docker info');
        printColored('green', '✅ Docker está corriendo');
        return true;
    } catch (error) {
        printColored('red', '❌ Docker no está corriendo. Por favor, inicia Docker Desktop primero.');
        return false;
    }
}

async function getDockerComposeCommand() {
    try {
        await execPromise('docker-compose --version');
        return 'docker-compose';
    } catch (error) {
        try {
            await execPromise('docker compose version');
            return 'docker compose';
        } catch (error2) {
            return 'docker-compose'; // fallback
        }
    }
}

async function checkContainer(containerName) {
    try {
        const { stdout } = await execPromise(`docker inspect --format "{{.State.Status}}" ${containerName}`);
        return stdout.trim() === 'running';
    } catch (error) {
        return false;
    }
}

async function containerExists(containerName) {
    try {
        await execPromise(`docker inspect ${containerName}`);
        return true;
    } catch (error) {
        return false;
    }
}

async function startPostgreSQL() {
    const containerName = 'medilogs-postgres';
    const isRunning = await checkContainer(containerName);
    
    if (isRunning) {
        printColored('green', '✅ El contenedor PostgreSQL ya está corriendo');
        return true;
    }

    const exists = await containerExists(containerName);
    
    if (exists) {
        printColored('yellow', '🔄 El contenedor existe pero no está corriendo. Iniciándolo...');
        try {
            await execPromise(`docker start ${containerName}`);
            printColored('green', '✅ Contenedor PostgreSQL iniciado');
            return true;
        } catch (error) {
            printColored('red', '❌ Error al iniciar el contenedor PostgreSQL');
            return false;
        }
    } else {
        printColored('yellow', `📦 El contenedor ${containerName} no existe. Creando con docker-compose...`);
        
        const projectRoot = path.resolve(__dirname, '../..');
        const dockerComposeCmd = await getDockerComposeCommand();
        
        try {
            await execPromise(`${dockerComposeCmd} up -d postgres`, { cwd: projectRoot });
            printColored('green', '✅ Contenedor PostgreSQL creado y iniciado');
            return true;
        } catch (error) {
            printColored('red', '❌ Error al crear el contenedor PostgreSQL');
            console.error(error.stderr || error.error?.message || error);
            return false;
        }
    }
}

async function waitForPostgreSQL() {
    const containerName = 'medilogs-postgres';
    const maxAttempts = 30;
    let attempt = 1;

    printColored('blue', '⏳ Esperando a que PostgreSQL esté listo...');
    
    // Esperar inicial
    await new Promise(resolve => setTimeout(resolve, 3000));

    while (attempt <= maxAttempts) {
        try {
            await execPromise(`docker exec ${containerName} pg_isready -U medilogs -d medilogs`);
            printColored('green', '✅ PostgreSQL está listo para conexiones');
            return true;
        } catch (error) {
            printColored('yellow', `⏳ Intento ${attempt}/${maxAttempts} - Esperando PostgreSQL...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempt++;
        }
    }

    printColored('red', `❌ PostgreSQL no respondió después de ${maxAttempts} intentos`);
    return false;
}

async function showContainerStatus() {
    printColored('blue', '📊 Estado del contenedor PostgreSQL:');
    try {
        // Usar comillas diferentes para Windows
        const command = os.platform() === 'win32' 
            ? 'docker ps --filter "name=medilogs-postgres" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"'
            : 'docker ps --filter "name=medilogs-postgres" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"';
            
        const { stdout } = await execPromise(command);
        console.log(stdout);
    } catch (error) {
        printColored('red', '❌ Error al obtener estado del contenedor');
    }
}

async function startDevelopmentServer() {
    // Configurar variables de entorno
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'medilogs';
    process.env.DB_USER = 'medilogs';
    process.env.DB_PASSWORD = 'Medilogs335!';

    printColored('green', '🚀 Iniciando servidor de desarrollo...');

    // Determinar el comando correcto según el OS
    const isWindows = os.platform() === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';
    
    // Iniciar el servidor de desarrollo
    const serverProcess = spawn(command, ['ts-node', 'src/core/server.ts'], {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
        env: process.env,
        shell: isWindows // En Windows necesitamos shell
    });

    // Manejar señales para terminar el proceso correctamente
    process.on('SIGINT', () => {
        printColored('yellow', '\n🛑 Deteniendo servidor...');
        serverProcess.kill('SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        serverProcess.kill('SIGTERM');
        process.exit(0);
    });

    // En Windows, manejar también Ctrl+C
    if (isWindows) {
        process.on('SIGBREAK', () => {
            printColored('yellow', '\n🛑 Deteniendo servidor...');
            serverProcess.kill();
            process.exit(0);
        });
    }

    serverProcess.on('close', (code) => {
        process.exit(code || 0);
    });

    serverProcess.on('error', (error) => {
        printColored('red', `❌ Error al iniciar el servidor: ${error.message}`);
        process.exit(1);
    });
}

async function main() {
    try {
        // Verificar Docker
        const dockerOk = await checkDocker();
        if (!dockerOk) {
            process.exit(1);
        }

        // Iniciar PostgreSQL
        const postgresOk = await startPostgreSQL();
        if (!postgresOk) {
            process.exit(1);
        }

        // Esperar a que PostgreSQL esté listo
        const readyOk = await waitForPostgreSQL();
        if (!readyOk) {
            process.exit(1);
        }

        // Mostrar estado del contenedor
        await showContainerStatus();

        // Iniciar servidor de desarrollo
        await startDevelopmentServer();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}


main();
