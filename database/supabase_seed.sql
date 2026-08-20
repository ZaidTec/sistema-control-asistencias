-- Seed inicial para Supabase (base de datos limpia).
-- Ejecutar DESPUÉS de supabase_schema.sql en el SQL Editor.

-- Usuario administrador (login: admin / PRUEBA_ADMIN)
INSERT INTO public.usuario (username, password_hash, rol, activo)
VALUES (
    'admin',
    '$2b$10$0XMIwf2j90Nq8w9GWrRWROva4r3CRY6ZV7hokM5xTtehKe.kYj8e.',
    'ADMINISTRADOR',
    true
);

-- Periodo escolar de ejemplo
INSERT INTO public.periodo_escolar (nombre, fecha_inicio, fecha_fin, activo)
VALUES ('Agosto-Diciembre 2026', '2026-08-17', '2026-12-18', true);