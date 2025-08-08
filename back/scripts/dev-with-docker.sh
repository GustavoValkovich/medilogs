#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_colored $BLUE "🔍 Verificando estado de Docker..."

# Verificar si Docker está corriendo
if ! docker info >/dev/null 2>&1; then
    print_colored $RED "❌ Docker no está corriendo. Por favor, inicia Docker Desktop primero."
    exit 1
fi

print_colored $GREEN "✅ Docker está corriendo"

# Obtener el directorio actual del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Verificar si el contenedor de PostgreSQL existe y está corriendo
CONTAINER_NAME="medilogs-postgres"
CONTAINER_STATUS=$(docker inspect --format '{{.State.Status}}' $CONTAINER_NAME 2>/dev/null)

if [ $? -ne 0 ]; then
    print_colored $YELLOW "📦 El contenedor $CONTAINER_NAME no existe. Creando con docker-compose..."
    cd "$PROJECT_ROOT"
    docker-compose up -d postgres
    if [ $? -eq 0 ]; then
        print_colored $GREEN "✅ Contenedor PostgreSQL creado y iniciado"
    else
        print_colored $RED "❌ Error al crear el contenedor PostgreSQL"
        exit 1
    fi
elif [ "$CONTAINER_STATUS" != "running" ]; then
    print_colored $YELLOW "🔄 El contenedor $CONTAINER_NAME existe pero no está corriendo. Iniciándolo..."
    docker start $CONTAINER_NAME
    if [ $? -eq 0 ]; then
        print_colored $GREEN "✅ Contenedor PostgreSQL iniciado"
    else
        print_colored $RED "❌ Error al iniciar el contenedor PostgreSQL"
        exit 1
    fi
else
    print_colored $GREEN "✅ El contenedor PostgreSQL ya está corriendo"
fi

# Esperar a que PostgreSQL esté listo
print_colored $BLUE "⏳ Esperando a que PostgreSQL esté listo..."
sleep 3

# Verificar la conexión a PostgreSQL
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec $CONTAINER_NAME pg_isready -U medilogs -d medilogs >/dev/null 2>&1; then
        print_colored $GREEN "✅ PostgreSQL está listo para conexiones"
        break
    else
        print_colored $YELLOW "⏳ Intento $attempt/$max_attempts - Esperando PostgreSQL..."
        sleep 2
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    print_colored $RED "❌ PostgreSQL no respondió después de $max_attempts intentos"
    exit 1
fi

# Mostrar información del contenedor
print_colored $BLUE "📊 Estado del contenedor PostgreSQL:"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Configurar variables de entorno para usar Docker
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=medilogs
export DB_USER=medilogs
export DB_PASSWORD=Medilogs335!

print_colored $GREEN "🚀 Iniciando servidor de desarrollo..."

# Ir al directorio back e iniciar el servidor
cd "$BACK_DIR"
npx ts-node src/core/server.ts


