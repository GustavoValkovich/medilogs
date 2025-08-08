# MediLogs6 - Docker Setup

Este archivo contiene la configuración de Docker Compose para PostgreSQL.

## Requisitos

- Docker
- Docker Compose

## Inicio Rápido

1. **Iniciar PostgreSQL con Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Verificar que PostgreSQL esté funcionando:**
   ```bash
   docker-compose ps
   ```

3. **Ver logs de PostgreSQL:**
   ```bash
   docker-compose logs postgres
   ```

4. **Conectar a PostgreSQL desde la aplicación:**
   - La base de datos estará disponible en `localhost:5432`
   - Usuario: `medilogs`
   - Contraseña: `Medilogs335!`
   - Base de datos: `medilogs`

## Comandos Útiles

### Parar los servicios
```bash
docker-compose down
```

### Parar y eliminar volúmenes (⚠️ **Elimina todos los datos**)
```bash
docker-compose down -v
```

### Reiniciar solo PostgreSQL
```bash
docker-compose restart postgres
```

### Acceder al terminal de PostgreSQL
```bash
docker-compose exec postgres psql -U medilogs -d medilogs
```

### Ver logs en tiempo real
```bash
docker-compose logs -f postgres
```

## Configuración de la Base de Datos

### Configuración Automática
- Al iniciar por primera vez, PostgreSQL ejecutará automáticamente el script `back/scripts/create-postgres-tables.sql`
- Esto creará todas las tablas necesarias

### Variables de Entorno
Puedes personalizar la configuración editando el archivo `docker-compose.yml`:

```yaml
environment:
  POSTGRES_DB: medilogs           # Nombre de la base de datos
  POSTGRES_USER: medilogs         # Usuario
  POSTGRES_PASSWORD: Medilogs335! # Contraseña
```

## Estructura de Volúmenes

- **postgres_data**: Almacena los datos de PostgreSQL de manera persistente
- **Configuración de red**: Los servicios se comunican a través de la red `medilogs-network`

## Troubleshooting

### PostgreSQL no se inicia
1. Verificar que el puerto 5432 no esté en uso:
   ```bash
   lsof -i :5432
   ```

2. Ver logs detallados:
   ```bash
   docker-compose logs postgres
   ```

### Resetear la base de datos
```bash
docker-compose down -v
docker-compose up -d
```

### Backup de la base de datos
```bash
docker-compose exec postgres pg_dump -U medilogs medilogs > backup.sql
```

### Restaurar backup
```bash
docker-compose exec -T postgres psql -U medilogs medilogs < backup.sql
```
