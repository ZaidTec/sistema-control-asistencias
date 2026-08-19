# Dependencias e instalacion

## Requisitos previos

- Node.js y npm
- PostgreSQL
- Git

Se recomienda usar una version LTS reciente de Node.js.

## Instalacion del backend

Desde la raiz del proyecto:

```powershell
cd backend
npm install
```

### Dependencias de produccion

| Paquete | Uso |
| --- | --- |
| `express` | Servidor HTTP y API REST |
| `pg` | Conexion con PostgreSQL |
| `bcrypt` | Hash y verificacion de contrasenas |
| `jsonwebtoken` | Autenticacion mediante JWT |
| `dotenv` | Variables de entorno |
| `cors` | Control de origenes permitidos |
| `helmet` | Cabeceras HTTP de seguridad |
| `express-rate-limit` | Limite de intentos de inicio de sesion |

### Dependencias de desarrollo

| Paquete | Uso |
| --- | --- |
| `nodemon` | Reinicio automatico durante el desarrollo |

## Instalacion del frontend

Desde la raiz del proyecto:

```powershell
cd frontend
npm install
```

### Dependencias de produccion

| Paquete | Uso |
| --- | --- |
| `react` | Interfaz de usuario |
| `react-dom` | Renderizado de React en el navegador |
| `react-router-dom` | Navegacion de la aplicacion |
| `axios` | Peticiones HTTP a la API |
| `lucide-react` | Iconos de la interfaz |

### Dependencias de desarrollo

| Paquete | Uso |
| --- | --- |
| `vite` | Servidor de desarrollo y compilacion |
| `@vitejs/plugin-react` | Integracion de React con Vite |
| `oxlint` | Analisis estatico y lint |
| `@types/react` | Tipos de React |
| `@types/react-dom` | Tipos de React DOM |

## Configuracion del backend

Copia `backend/.env.example` como `backend/.env` y completa los valores:

```powershell
Copy-Item backend/.env.example backend/.env
```

El `JWT_SECRET` debe ser aleatorio y tener al menos 32 caracteres. Puedes generarlo con:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Nunca subas `backend/.env` al repositorio.

## Ejecutar el proyecto

Abre dos terminales.

Terminal 1, backend:

```powershell
cd backend
npm run dev
```

Terminal 2, frontend:

```powershell
cd frontend
npm run dev
```

El backend usa normalmente `http://localhost:3000` y Vite muestra en la terminal la URL del frontend.

## Comandos utiles

Backend:

```powershell
npm start      # Ejecutar sin nodemon
npm run dev    # Desarrollo con reinicio automatico
```

Frontend:

```powershell
npm run dev    # Servidor de desarrollo
npm run build  # Compilacion de produccion
npm run lint   # Revisar el codigo
```

Los archivos `package-lock.json` fijan las versiones instaladas. Por eso, para instalar el proyecto basta con ejecutar `npm install` dentro de cada carpeta (`backend` y `frontend`).
