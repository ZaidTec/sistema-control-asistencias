# Sistema de Control de Asistencias

Sistema web para el control de asistencias de profesores.

El sistema permite administrar docentes, materias, grupos, salones, periodos escolares, horarios y sesiones de clase, además de registrar y consultar asistencias.

---

## Tecnologías

### Backend

- Node.js
- Express.js
- PostgreSQL
- JavaScript
- REST API

### Base de datos

- PostgreSQL

### Herramientas utilizadas

- Visual Studio Code
- Thunder Client
- Git
- GitHub

---

## Estructura del proyecto

```text
sistema-control-asistencias/
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── docenteController.js
│   │   │   ├── materiaController.js
│   │   │   ├── grupoController.js
│   │   │   ├── salonController.js
│   │   │   ├── periodoController.js
│   │   │   ├── asignacionController.js
│   │   │   ├── sesionController.js
│   │   │   └── asistenciaController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── docenteRoutes.js
│   │   │   ├── materiaRoutes.js
│   │   │   ├── grupoRoutes.js
│   │   │   ├── salonRoutes.js
│   │   │   ├── periodoRoutes.js
│   │   │   ├── asignacionRoutes.js
│   │   │   ├── sesionRoutes.js
│   │   │   └── asistenciaRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   └── database.sql
│
└── README.md




Requisitos

Antes de ejecutar el proyecto es necesario tener instalado:

Node.js
npm
PostgreSQL
Git

Se recomienda utilizar una versión reciente de Node.js.

Dependencias del backend

Las principales dependencias utilizadas son:

express
pg
cors
dotenv
Dependencias de desarrollo
nodemon


Instalación
1. Clonar el repositorio

git clone URL_DEL_REPOSITORIO

Entrar al proyecto:

cd sistema-control-asistencias

Entrar al backend:

cd backend


2. Instalar dependencias

Dentro de la carpeta backend ejecutar:

npm install

Esto instalará automáticamente las dependencias especificadas en package.json.

3. Configurar PostgreSQL

Crear una base de datos en PostgreSQL.

Ejemplo:

CREATE DATABASE control_asistencias;

Después ejecutar el archivo SQL del proyecto para crear las tablas:

database/database.sql
4. Configurar variables de entorno

Dentro de:

backend/

crear un archivo:

.env

Ejemplo:

PORT=3000


DB_HOST=localhost
DB_PORT=5432
DB_NAME=control_asistencias
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD

No subir el archivo .env a GitHub.

5. Ejecutar el backend

Desde la carpeta backend:

npm start

El servidor deberá iniciar en:

http://localhost:3000
6. Ejecutar en modo desarrollo

Si el proyecto tiene configurado nodemon, utilizar:

npm run dev

Esto permite que el servidor se reinicie automáticamente cuando se modifica el código.

API

La API utiliza rutas REST.

Prueba del servidor
GET /api/test-db

Ejemplo:

http://localhost:3000/api/test-db
Docentes
Obtener docentes
GET /api/docentes
Obtener docente por ID
GET /api/docentes/:id
Crear docente
POST /api/docentes
Actualizar docente
PUT /api/docentes/:id
Desactivar docente
DELETE /api/docentes/:id
Materias
Obtener materias
GET /api/materias
Obtener materia
GET /api/materias/:id
Crear materia
POST /api/materias
Actualizar materia
PUT /api/materias/:id
Desactivar materia
DELETE /api/materias/:id
Grupos

Los grupos son administrados por el administrador del sistema.

Ejemplos:

S8A
S8V
S7A
S7V
Obtener grupos
GET /api/grupos
Crear grupo
POST /api/grupos
Actualizar grupo
PUT /api/grupos/:id
Desactivar grupo
DELETE /api/grupos/:id
Salones

Los salones están numerados del 1 al 45.

Un mismo salón puede utilizarse en diferentes horarios.

Obtener salones
GET /api/salones
Crear salón
POST /api/salones
Actualizar salón
PUT /api/salones/:id
Periodos escolares

Los periodos manejados por el sistema son:

Enero - Julio
Agosto - Diciembre

Ejemplo:

Agosto-Diciembre 2026
Obtener periodos
GET /api/periodos
Crear periodo
POST /api/periodos
Actualizar periodo
PUT /api/periodos/:id
Asignaciones de clase

Una asignación relaciona:

Profesor
   +
Materia
   +
Grupo
   +
Salón
   +
Periodo
   +
Día
   +
Horario

Ejemplo:

Profesor: Juan Pérez
Materia: Programación Web
Grupo: S8A
Salón: 12
Lunes
08:00 - 10:00
Periodo: Agosto-Diciembre 2026
Obtener asignaciones
GET /api/asignaciones
Crear asignación
POST /api/asignaciones
Actualizar asignación
PUT /api/asignaciones/:id
Eliminar/desactivar asignación
DELETE /api/asignaciones/:id

El sistema valida conflictos de horario y salón para evitar que dos profesores tengan el mismo salón al mismo tiempo.

Sesiones de clase

Las sesiones representan cada clase individual del calendario.

Una asignación puede generar múltiples sesiones.

Ejemplo:

Asignación:
Lunes 08:00 - 10:00


Sesiones:


17/08/2026
24/08/2026
31/08/2026
07/09/2026
...
Obtener todas las sesiones
GET /api/sesiones
Obtener sesiones del día
GET /api/sesiones/hoy
Obtener sesiones de una fecha
GET /api/sesiones/fecha/:fecha

Ejemplo:

GET /api/sesiones/fecha/2026-08-17
Generar sesiones automáticamente
POST /api/sesiones/generar

Body:

{
    "asignacion_id": 1
}

El sistema genera las sesiones correspondientes al periodo escolar de la asignación.

Asistencias

Las asistencias se registran por cada sesión de clase.

Los estados permitidos son:

PRESENTE
AUSENTE
RETARDO
Presente

No requiere observaciones.

Ejemplo:

{
    "sesion_clase_id": 1,
    "usuario_id": 1,
    "estado": "PRESENTE"
}
Ausente

Puede incluir observaciones.

{
    "sesion_clase_id": 2,
    "usuario_id": 1,
    "estado": "AUSENTE",
    "observaciones": "No se presentó a clase"
}
Retardo

Puede incluir observaciones.

{
    "sesion_clase_id": 3,
    "usuario_id": 1,
    "estado": "RETARDO",
    "observaciones": "Llegó después de iniciar la clase"
}

El sistema no almacena los minutos exactos del retardo.

Endpoints de asistencia
Obtener asistencias
GET /api/asistencias
Registrar asistencia
POST /api/asistencias
Actualizar asistencia
PUT /api/asistencias/:id

El sistema evita que un usuario registre dos veces la asistencia para la misma sesión.

Roles

Actualmente se contemplan dos tipos de usuarios:

Administrador

Puede realizar operaciones CRUD sobre la información del sistema.

Puede administrar:

Docentes
Materias
Grupos
Salones
Periodos
Asignaciones
Sesiones
Usuarios
Asistencias
Usuario

Los usuarios son quienes registran las asistencias.

Los profesores no necesitan crear una cuenta.

Base de datos

La base de datos está desarrollada en PostgreSQL.

Principales tablas:

docente
materia
periodo_escolar
salon
grupo
asignacion_clase
sesion_clase
registro_asistencia
usuario

Relación principal:

periodo_escolar
       │
       ▼
asignacion_clase
       │
       ├──────── docente
       ├──────── materia
       ├──────── grupo
       └──────── salon
              │
              ▼
        sesion_clase
              │
              ▼
     registro_asistencia
              │
              ▼
           usuario
Estado actual del proyecto
Backend
 Conexión con PostgreSQL
 Servidor Express
 CRUD de docentes
 CRUD de materias
 CRUD de grupos
 CRUD de salones
 CRUD de periodos
 CRUD de asignaciones
 Validación de conflictos de horario
 Generación automática de sesiones
 Consulta de sesiones
 Consulta de sesiones por fecha
 Registro de asistencias
 Actualización de asistencias
 Validación de estados de asistencia
Pendiente
 Autenticación
 Login
 Control de permisos por rol
 Reportes de asistencia
 Filtros por semana y mes
 Reportes por periodo escolar
 Exportación/impresión de reportes
 Frontend
 Calendario visual
 Integración frontend + backend
Desarrollo

Para trabajar localmente:

cd backend
npm install
npm run dev

Servidor:

http://localhost:3000
Variables de entorno

Nunca subir credenciales de PostgreSQL al repositorio.

El archivo .env debe estar incluido en .gitignore.

Ejemplo de .gitignore:

node_modules/
.env
.env.*
!.env.example

Se puede incluir un archivo:

.env.example

con:

PORT=3000


DB_HOST=localhost
DB_PORT=5432
DB_NAME=control_asistencias
DB_USER=postgres
DB_PASSWORD=

Cada desarrollador deberá crear su propio .env.

Autor

Proyecto académico:

Sistema de Control de Asistencias para Profesores



### También te recomiendo revisar tu `package.json`


Debería tener algo parecido a esto:


```json
{
  "name": "sistema-control-asistencias-backend",
  "version": "1.0.0",
  "description": "Backend para sistema de control de asistencias de profesores",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^5.1.0",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}