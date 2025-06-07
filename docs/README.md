**DISEÑO DE ENDPOINTS**

1. **Autenticación (HU1 y HU2)**

**POST /auth/login**

- **Descripción:** Inicia sesión del PI.
- **Body:** { "username": "usuario", "password": "secreta" }
- **Respuestas:**
  - 200 OK → { token, user }
  - 401 Unauthorized → Credenciales inválidas
  - 400 Bad Request → Campos vacíos

**POST /auth/logout**

- **Descripción:** Cierra sesión del PI (invalidación del token).
- **Header:** Authorization: Bearer &lt;token&gt;
- **Respuesta:** 200 OK

**GET /auth/session**

- **Descripción:** Valida sesión activa / renovarla si corresponde.

| Método | Ruta | Descripción | Autenticación |
| --- | --- | --- | --- |
| POST | /auth/login | Iniciar sesión y obtener token JWT | ❌   |
| POST | /auth/logout | Cerrar sesión (invalidar token) | ✅   |
| GET | /auth/session | Valida sesión activa / renovarla si corresponde | ✅   |

1. **Pacientes (HU3, HU4, HU5)**

**POST /pacientes**

- **Descripción:** Registra un nuevo paciente.
- **Body:**
```
{

"nombre": "Juan Pérez",

"fechaNacimiento": "1985-06-15",

"dni": "12345678",

"localidad": "Córdoba",

"obraSocial": "OSDE",

"advertencia": "Alergia a penicilina"

}
```

- **Respuestas:**
  - 201 Created
  - 400 Bad Request → Falta campo obligatorio
  - 409 Conflict → Paciente ya registrado (DNI duplicado)

**GET /pacientes**

- **Descripción:** Obtiene lista de pacientes.
- **Query params opcionales:**
  - search=apellido **→ búsqueda por nombre, apellido, DNI o localidad**
- **Respuestas:**
  - 200 OK → Lista de pacientes
  - 204 No Content → Lista vacía

**GET /pacientes/:id**

- **Descripción:** Ver los datos de un paciente por su ID.
- **Respuesta:**
  - 200 OK o 404 Not Found

**PUT /pacientes/:id**

- **Descripción:** Modifica datos personales del paciente**.**
- **Body:** Igual que en POST, pero parcial.
- **Respuesta:**
  - 200 OK o 404 Not Found

**DELETE /pacientes/:id**

- **Descripción:** Elimina un paciente (a definir si se anula).
- **Respuesta:**
  - 204 No Content

| Método | Ruta | Descripción | Autenticación |
| --- | --- | --- | --- |
| POST | /pacientes | Registrar un nuevo paciente | ✅   |
| GET | /pacientes | Obtener lista de pacientes (con búsqueda) | ✅   |
| GET | /pacientes/:id | Obtener detalles de un paciente | ✅   |
| PUT | /pacientes/:id | Editar datos personales de un paciente | ✅   |
| DELETE | /pacientes/:id | Eliminar un paciente (a confirmar) | ✅   |

1. **Historias Clínicas (HU8, HU9, HU10, HU11, HU12)**

**POST /pacientes/:id/historias-clinicas**

- **Descripción:** Crea una nueva entrada de historia clínica para un paciente.
- **Body (multipart/form-data si hay archivo):**
```
{

"fecha": "2025-06-05",

"detalle": "Control general, sin novedades.",

"adjunto": archivo (opcional: PDF, JPG, PNG)

}
```
- **Respuestas:**
  - 201 Created
  - 400 Bad Request
  - 404 Not Found → Paciente inexistente

**GET /pacientes/:id/historias-clinicas**

- **Descripción:** Lista todas las historias clínicas del paciente.
- **Respuesta:**
```
\[

{

"id": 1,

"fecha": "2025-06-05",

"detalle": "...",

"tieneAdjunto": true

}

\]
```
**GET /historias-clinicas/:id**

- **Descripción:** Obtiene los detalles de una historia clínica específica.
- **Incluye:** detalle, fecha, y si tiene archivo adjunto

**GET /historias-clinicas/:id/adjunto**

- **Descripción:** Previsualiza o descarga el archivo adjunto.
- **Headers:**
  - Para descarga: Content-Disposition: attachment
  - Para preview: Content-Type: application/pdf, etc.

**PUT /historias-clinicas/:id**

- **(Revisar si se habilita)** Modifica una entrada de historia clínica.
- **Body:** campos editables (ej. detalle, no se edita el archivo)
- **Respuesta:** 200 OK o 403 Forbidden si no se permite edición

| Método | Ruta | Descripción | Autenticación |
| --- | --- | --- | --- |
| POST | /pacientes/:id/historias-clinicas | Crear una historia clínica con o sin adjunto | ✅   |
| GET | /pacientes/:id/historias-clinicas | Listar historias clínicas del paciente | ✅   |
| GET | /historias-clinicas/:id | Obtener detalles de una historia clínica específica | ✅   |
| GET | /historias-clinicas/:id/adjunto | Descargar o previsualizar archivo adjunto | ✅   |
| PUT | /historias-clinicas/:id | Editar una historia clínica (a confirmar) | ✅   |

1. **Turnos y Agenda (HU13)**

**GET /agenda**

- **Descripción:** Lista de turnos del PI, agrupados por día (por defecto: día actual).
- **Query Params:** ?fecha=2025-06-05
- **Respuesta:**
```
\[

{

"hora": "09:00",

"paciente": "Juan Pérez",

"motivo": "Consulta general"

}

\]
```
| Método | Ruta | Descripción | Autenticación |
| --- | --- | --- | --- |
| GET | /agenda | Obtener agenda diaria de turnos | ✅   |

1. **Exportación de historia clínica (HU14)**

**GET /pacientes/:id/historias-clinicas/exportar**

- **Descripción:** Genera y descarga un PDF con todo el historial clínico del paciente.
- **Headers:**
  - **Content-Type:** application/pdf
  - **Content-Disposition:** attachment; filename="historial_Juan_Perez.pdf"

| Método | Ruta | Descripción | Autenticación |
| --- | --- | --- | --- |
| GET | /pacientes/:id/historias-clinicas/exportar | Exportar historia clínica completa en PDF | ✅   |

**NOTAS GENERALES**

- Todos los _endpoints_ (excepto login) requieren token JWT en el header. Authorization: Bearer &lt;token&gt;.
- Los _endpoints_ están organizados RESTful, con rutas anidadas para recursos dependientes (ej. historia clínica dentro de paciente).
- Se asume control de errores (404, 400, 409, etc.) y validaciones en backend.