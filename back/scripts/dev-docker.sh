#!/bin/bash

# Script avanzado para desarrollo con Docker
# Uso: npm run dev:docker [opciones]
# Opciones:
#   --fresh    : Recrear contenedores desde cero
#   --logs     : Mostrar logs de PostgreSQL
#   --stop     : Detener contenedores
#   --status   : Mostrar estado de contenedores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    print_colored $PURPLE "════════════════════════════════════════"
    print_colored $PURPLE "  🏥 MediLogs Development Environment"
    print_colored $PURPLE "════════════════════════════════════════"
}

show_status() {
    print_colored $BLUE "📊 Estado de contenedores:"
    docker-compose ps
    echo ""
    print_colored $BLUE "📊 Contenedores PostgreSQL:"
    docker ps --filter "name=medilogs-postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
}

stop_containers() {
    print_colored $YELLOW "🛑 Deteniendo contenedores..."
    cd ..
    docker-compose down
    print_colored $GREEN "✅ Contenedores detenidos"
}

show_logs() {
    print_colored $BLUE "📋 Logs de PostgreSQL (últimas 50 líneas):"
    docker logs --tail 50 medilogs-postgres
}

fresh_start() {
    print_colored $YELLOW "🔄 Recreando contenedores desde cero..."
    cd ..
    docker-compose down -v
    docker-compose up -d postgres
    print_colored $GREEN "✅ Contenedores recreados"
}

# Procesar argumentos
case "$1" in
    --status)
        print_header
        show_status
        exit 0
        ;;
    --stop)
        print_header
        stop_containers
        exit 0
        ;;
    --logs)
        print_header
        show_logs
        exit 0
        ;;
    --fresh)
        print_header
        fresh_start
        ;;
    --help|-h)
        print_header
        echo ""
        print_colored $BLUE "Uso: npm run dev:docker [opciones]"
        echo ""
        print_colored $YELLOW "Opciones:"
        echo "  --fresh    Recrear contenedores desde cero"
        echo "  --logs     Mostrar logs de PostgreSQL"
        echo "  --stop     Detener contenedores"
        echo "  --status   Mostrar estado de contenedores"
        echo "  --help     Mostrar esta ayuda"
        echo ""
        exit 0
        ;;
    "")
        print_header
        ;;
    *)
        print_colored $RED "❌ Opción desconocida: $1"
        print_colored $YELLOW "Usa --help para ver las opciones disponibles"
        exit 1
        ;;
esac

# Verificar Docker
print_colored $BLUE "🔍 Verificando Docker..."
if ! docker info >/dev/null 2>&1; then
    print_colored $RED "❌ Docker no está corriendo"
    print_colored $YELLOW "💡 Inicia Docker Desktop e intenta de nuevo"
    exit 1
fi
print_colored $GREEN "✅ Docker está corriendo"

# Verificar docker-compose
if ! command -v docker-compose &> /dev/null; then
    print_colored $RED "❌ docker-compose no está instalado"
    exit 1
fi

# Ir al directorio raíz
cd ..

# Verificar contenedor PostgreSQL
CONTAINER_NAME="medilogs-postgres"
if ! docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    print_colored $YELLOW "📦 Iniciando contenedor PostgreSQL..."
    docker-compose up -d postgres
    
    if [ $? -ne 0 ]; then
        print_colored $RED "❌ Error al iniciar PostgreSQL"
        exit 1
    fi
    print_colored $GREEN "✅ PostgreSQL iniciado"
else
    print_colored $GREEN "✅ PostgreSQL ya está corriendo"
fi

# Esperar conexión
print_colored $BLUE "⏳ Verificando conexión a PostgreSQL..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec $CONTAINER_NAME pg_isready -U medilogs -d medilogs >/dev/null 2>&1; then
        print_colored $GREEN "✅ PostgreSQL listo para conexiones"
        break
    fi
    
    if [ $((attempt % 5)) -eq 0 ]; then
        print_colored $YELLOW "⏳ Intento $attempt/$max_attempts..."
    fi
    
    sleep 1
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    print_colored $RED "❌ PostgreSQL no respondió"
    print_colored $YELLOW "💡 Intenta con: npm run dev:docker --logs"
    exit 1
fi

# Mostrar estado
show_status

# Configurar entorno
print_colored $BLUE "⚙️  Configurando variables de entorno..."
export DB_HOST=localhost
export DB_PORT=5432

print_colored $GREEN "🚀 Iniciando servidor de desarrollo..."
echo ""

# Cambiar de vuelta al directorio back
cd back

# Iniciar servidor
npx ts-node src/core/server.ts
