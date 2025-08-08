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
    purple: '\x1b[35m',
    reset: '\x1b[0m'
};

function printColored(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader() {
    console.log();
    printColored('purple', '════════════════════════════════════════');
    printColored('purple', '  🏥 MediLogs Development Environment');
    printColored('purple', '════════════════════════════════════════');
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
        printColored('red', '❌ Docker no está corriendo');
        printColored('yellow', '💡 Inicia Docker Desktop e intenta de nuevo');
        return false;
    }
}

async function checkDockerCompose() {
    try {
        await execPromise('docker-compose --version');
        return 'docker-compose';
    } catch (error) {
        try {
            await execPromise('docker compose version');
            return 'docker compose';
        } catch (error2) {
            printColored('red', '❌ docker-compose no está instalado');
            return null;
        }
    }
}

async function checkContainer(containerName) {
    try {
        const { stdout } = await execPromise(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);
        return stdout.trim().includes(containerName);
    } catch (error) {
        return false;
    }
}

async function showStatus() {
    printColored('blue', '📊 Estado de contenedores:');
    try {
        const projectRoot = path.resolve(__dirname, '../..');
        const dockerComposeCmd = await checkDockerCompose();
        if (dockerComposeCmd) {
            const { stdout } = await execPromise(`${dockerComposeCmd} ps`, { cwd: projectRoot });
            console.log(stdout);
        }
    } catch (error) {
        printColored('yellow', '⚠️  No se pudo obtener el estado con docker-compose');
    }
    
    console.log();
    printColored('blue', '📊 Contenedores PostgreSQL:');
    try {
        const command = os.platform() === 'win32'
            ? 'docker ps --filter "name=medilogs-postgres" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}\\t{{.Image}}"'
            : 'docker ps --filter "name=medilogs-postgres" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}\\t{{.Image}}"';
        const { stdout } = await execPromise(command);
        console.log(stdout);
    } catch (error) {
        printColored('red', '❌ Error al obtener estado del contenedor PostgreSQL');
    }
}

async function stopContainers() {
    printColored('yellow', '🛑 Deteniendo contenedores...');
    try {
        const projectRoot = path.resolve(__dirname, '../..');
        const dockerComposeCmd = await checkDockerCompose();
        if (dockerComposeCmd) {
            await execPromise(`${dockerComposeCmd} down`, { cwd: projectRoot });
            printColored('green', '✅ Contenedores detenidos');
        }
    } catch (error) {
        printColored('red', '❌ Error al detener contenedores');
        console.error(error.stderr || error.error?.message || error);
    }
}

async function showLogs() {
    printColored('blue', '📋 Logs de PostgreSQL (últimas 50 líneas):');
    try {
        const { stdout } = await execPromise('docker logs --tail 50 medilogs-postgres');
        console.log(stdout);
    } catch (error) {
        printColored('red', '❌ Error al obtener logs');
        console.error(error.stderr || error.error?.message || error);
    }
}

async function freshStart() {
    printColored('yellow', '🔄 Recreando contenedores desde cero...');
    try {
        const projectRoot = path.resolve(__dirname, '../..');
        const dockerComposeCmd = await checkDockerCompose();
        if (dockerComposeCmd) {
            await execPromise(`${dockerComposeCmd} down -v`, { cwd: projectRoot });
            await execPromise(`${dockerComposeCmd} up -d postgres`, { cwd: projectRoot });
            printColored('green', '✅ Contenedores recreados');
        }
    } catch (error) {
        printColored('red', '❌ Error al recrear contenedores');
        console.error(error.stderr || error.error?.message || error);
    }
}

async function startPostgreSQL() {
    const containerName = 'medilogs-postgres';
    const isRunning = await checkContainer(containerName);
    
    if (isRunning) {
        printColored('green', '✅ PostgreSQL ya está corriendo');
        return true;
    }

    printColored('yellow', '📦 Iniciando contenedor PostgreSQL...');
    
    const projectRoot = path.resolve(__dirname, '../..');
    const dockerComposeCmd = await checkDockerCompose();
    
    if (!dockerComposeCmd) {
        return false;
    }
    
    try {
        await execPromise(`${dockerComposeCmd} up -d postgres`, { cwd: projectRoot });
        printColored('green', '✅ PostgreSQL iniciado');
        return true;
    } catch (error) {
        printColored('red', '❌ Error al iniciar PostgreSQL');
        console.error(error.stderr || error.error?.message || error);
        return false;
    }
}

async function waitForPostgreSQL() {
    const containerName = 'medilogs-postgres';
    const maxAttempts = 30;
    let attempt = 1;

    printColored('blue', '⏳ Verificando conexión a PostgreSQL...');

    while (attempt <= maxAttempts) {
        try {
            await execPromise(`docker exec ${containerName} pg_isready -U medilogs -d medilogs`);
            printColored('green', '✅ PostgreSQL listo para conexiones');
            return true;
        } catch (error) {
            if (attempt % 5 === 0) {
                printColored('yellow', `⏳ Intento ${attempt}/${maxAttempts}...`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempt++;
        }
    }

    printColored('red', '❌ PostgreSQL no respondió');
    printColored('yellow', '💡 Intenta con: npm run dev:docker:logs');
    return false;
}

async function startDevelopmentServer() {
    printColored('blue', '⚙️  Configurando variables de entorno...');
    
    // Configurar variables de entorno
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'medilogs';
    process.env.DB_USER = 'medilogs';
    process.env.DB_PASSWORD = 'Medilogs335!';

    printColored('green', '🚀 Iniciando servidor de desarrollo...');
    console.log();

    // Determinar el comando correcto según el OS
    const isWindows = os.platform() === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';

    // Iniciar el servidor de desarrollo
    const serverProcess = spawn(command, ['ts-node', 'src/core/server.ts'], {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
        env: process.env,
        shell: isWindows
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

async function handleCommand(command) {
    switch (command) {
        case '--status':
            printHeader();
            await showStatus();
            break;

        case '--stop':
            printHeader();
            await stopContainers();
            break;

        case '--logs':
            printHeader();
            await showLogs();
            break;

        case '--fresh':
            printHeader();
            await freshStart();
            break;

        case '--help':
        case '-h':
            printHeader();
            console.log();
            printColored('blue', 'Uso: npm run dev:docker [opciones]');
            console.log();
            printColored('yellow', 'Opciones:');
            console.log('  --fresh    Recrear contenedores desde cero');
            console.log('  --logs     Mostrar logs de PostgreSQL');
            console.log('  --stop     Detener contenedores');
            console.log('  --status   Mostrar estado de contenedores');
            console.log('  --help     Mostrar esta ayuda');
            console.log();
            break;

        default:
            if (command && command.startsWith('--')) {
                printColored('red', `❌ Opción desconocida: ${command}`);
                printColored('yellow', 'Usa --help para ver las opciones disponibles');
                process.exit(1);
            }
            // Si no hay comando, ejecutar el flujo normal
            await main();
            break;
    }
}

async function main() {
    printHeader();

    // Verificar Docker
    const dockerOk = await checkDocker();
    if (!dockerOk) {
        process.exit(1);
    }

    // Verificar docker-compose
    const composeCmd = await checkDockerCompose();
    if (!composeCmd) {
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

    // Mostrar estado
    await showStatus();

    // Iniciar servidor de desarrollo
    await startDevelopmentServer();
}

// Procesar argumentos de línea de comandos
const command = process.argv[2];

if (command) {
    handleCommand(command).catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
} else {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}