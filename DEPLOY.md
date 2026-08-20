# Guía de despliegue: Supabase + Render

Despliegue del sistema de control de asistencias en línea con:
- **Supabase** → base de datos PostgreSQL en la nube.
- **Render** → backend (Web Service Node) y frontend (Static Site React).

Los cambios de código necesarios ya están hechos en el repo:
- Backend lee `DATABASE_URL` (connection string de Supabase) con SSL.
- CORS restringido a `CORS_ORIGIN` (lista separada por comas).
- Frontend usa `VITE_API_URL` para apuntar a la API.
- `frontend/public/_redirects` permite refrescar rutas SPA (`/dashboard`, `/reportes`, etc.).

---

## 1. Supabase (base de datos)

1. Crea una cuenta en <https://supabase.com> y un **proyecto** (elige la región más cercana).
2. Entra en **Settings → Database → Connection string** y copia la cadena **Direct connection**:
   ```
   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```
   Guárdala (la usarás en Render como `DATABASE_URL`).
3. Ve a **SQL Editor** y ejecuta los archivos en orden (pega todo el contenido):
   1. `database/supabase_schema.sql` — crea las tablas, índices y restricciones.
   2. `database/supabase_seed.sql` — crea el usuario admin y un periodo escolar.
4. Usuario inicial: **`admin` / `PRUEBA_ADMIN`** (puedes cambiarlo después).

> Los archivos son compatibles con PostgreSQL 15 (el dump original era de PG18).

---

## 2. Render — Backend (Web Service)

1. Crea una cuenta en <https://render.com> y conecta tu repositorio de GitHub.
2. **New → Web Service** → selecciona `sistema-control-asistencias`.
3. Configura:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/`
4. En **Environment** define:
   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la connection string de Supabase (paso 1.2) |
   | `JWT_SECRET` | clave aleatoria larga (ej. `openssl rand -hex 32`) |
   | `JWT_EXPIRES_IN` | `24h` |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | `https://<frontend>.onrender.com,http://localhost:5173` |
5. Nombra el servicio para que la URL sea predecible, ej. `dsc-backend` → `https://dsc-backend.onrender.com`. Anota esa URL.
6. **Deploy**. Al terminar verifica con:
   ```
   curl https://<backend>.onrender.com/
   ```
   Debe responder `{"mensaje":"API del sistema de control de asistencias funcionando"}`.

> `CORS_ORIGIN` requiere la URL del frontend; si aún no la tienes, ponla después de crear el Static Site y haz **Manual Deploy → Deploy latest commit**.

---

## 3. Render — Frontend (Static Site)

1. **New → Static Site** → selecciona el mismo repo.
2. Configura:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. En **Environment** (variables de **build**) define:
   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | `https://<backend>.onrender.com/api` |
4. Nombra el servicio, ej. `dsc-frontend` → `https://dsc-frontend.onrender.com`.
5. **Deploy**.

> `VITE_API_URL` se incrusta en el build: si cambias la URL de la API, vuelve a desplegar el frontend.

---

## 4. Verificación final

1. Abre `https://<frontend>.onrender.com` → inicia sesión con `admin` / `PRUEBA_ADMIN`.
2. Prueba Dashboard, Reportes, Docentes y Horarios.
3. Refresca una ruta interna (ej. `/dashboard`) para confirmar el fallback SPA.

---

## Notas

- En el plan gratuito de Render el backend **se duerme tras ~15 min sin tráfico**: la primera petición tras el sueño tarda unos segundos (cold start).
- Para actualizar el sistema basta con hacer `git push` a la rama conectada (despliegue automático).
- No expongas `JWT_SECRET` ni `DATABASE_URL` en el repositorio: van solo en las variables de entorno de Render.