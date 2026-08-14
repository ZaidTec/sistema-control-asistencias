--
-- PostgreSQL database dump
--

\restrict S67dUN9Pddfx8VHgIs5oQFax4nCpYXq7052Cb2csHXvTTHr8Mn0rVcK3Ojh53h2

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asignacion_clase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignacion_clase (
    id integer NOT NULL,
    docente_id integer NOT NULL,
    materia_id integer NOT NULL,
    grupo_id integer NOT NULL,
    salon_id integer NOT NULL,
    periodo_id integer NOT NULL,
    dia_semana integer NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT asignacion_dia_valido CHECK (((dia_semana >= 1) AND (dia_semana <= 7))),
    CONSTRAINT asignacion_horario_valido CHECK ((hora_fin > hora_inicio))
);


ALTER TABLE public.asignacion_clase OWNER TO postgres;

--
-- Name: asignacion_clase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asignacion_clase ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.asignacion_clase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: docente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.docente (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido_p character varying(100) NOT NULL,
    apellido_m character varying(100) NOT NULL,
    rfc character varying(13) NOT NULL,
    telefono character varying(20) NOT NULL,
    correo_personal character varying(150) NOT NULL,
    correo_institucional character varying(150) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.docente OWNER TO postgres;

--
-- Name: docente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.docente ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.docente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: grupo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grupo (
    id integer NOT NULL,
    clave character varying(20) NOT NULL,
    semestre smallint NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.grupo OWNER TO postgres;

--
-- Name: grupo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.grupo ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.grupo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: materia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materia (
    id integer NOT NULL,
    clave character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.materia OWNER TO postgres;

--
-- Name: materia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.materia ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.materia_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: periodo_escolar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periodo_escolar (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT periodo_fechas_validas CHECK ((fecha_fin > fecha_inicio))
);


ALTER TABLE public.periodo_escolar OWNER TO postgres;

--
-- Name: periodo_escolar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.periodo_escolar ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.periodo_escolar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: registro_asistencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_asistencia (
    id integer NOT NULL,
    sesion_clase_id integer NOT NULL,
    usuario_id integer NOT NULL,
    estado character varying(10) NOT NULL,
    observaciones character varying(500),
    CONSTRAINT asistencia_estado_valido CHECK (((estado)::text = ANY ((ARRAY['PRESENTE'::character varying, 'AUSENTE'::character varying, 'RETARDO'::character varying])::text[])))
);


ALTER TABLE public.registro_asistencia OWNER TO postgres;

--
-- Name: registro_asistencia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.registro_asistencia ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.registro_asistencia_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: salon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salon (
    id integer NOT NULL,
    numero character varying(10) NOT NULL
);


ALTER TABLE public.salon OWNER TO postgres;

--
-- Name: salon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.salon ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.salon_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sesion_clase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesion_clase (
    id integer NOT NULL,
    asignacion_id integer NOT NULL,
    fecha date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    CONSTRAINT sesion_horario_valido CHECK ((hora_fin > hora_inicio))
);


ALTER TABLE public.sesion_clase OWNER TO postgres;

--
-- Name: sesion_clase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sesion_clase ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sesion_clase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(20) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT usuario_rol_valido CHECK (((rol)::text = ANY ((ARRAY['ADMINISTRADOR'::character varying, 'USUARIO'::character varying])::text[])))
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuario ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: asignacion_clase; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.asignacion_clase OVERRIDING SYSTEM VALUE VALUES (5, 1, 1, 1, 12, 2, 1, '07:00:00', '09:00:00', true);
INSERT INTO public.asignacion_clase OVERRIDING SYSTEM VALUE VALUES (6, 1, 2, 2, 15, 2, 3, '10:00:00', '12:00:00', true);
INSERT INTO public.asignacion_clase OVERRIDING SYSTEM VALUE VALUES (7, 2, 3, 3, 20, 2, 1, '09:00:00', '11:00:00', true);
INSERT INTO public.asignacion_clase OVERRIDING SYSTEM VALUE VALUES (8, 3, 1, 4, 25, 2, 2, '08:00:00', '10:00:00', true);


--
-- Data for Name: docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.docente OVERRIDING SYSTEM VALUE VALUES (1, 'Juan', 'Perez', 'Lopez', 'PELJ900101ABC', '5551234567', 'juan.perez@gmail.com', 'juan.perez@escuela.edu.mx', true);
INSERT INTO public.docente OVERRIDING SYSTEM VALUE VALUES (2, 'Maria', 'Gonzalez', 'Hernandez', 'GOHM850505XYZ', '5552345678', 'maria.gonzalez@gmail.com', 'maria.gonzalez@escuela.edu.mx', true);
INSERT INTO public.docente OVERRIDING SYSTEM VALUE VALUES (3, 'Carlos', 'Ramirez', 'Martinez', 'RAMC920808DEF', '5553456789', 'carlos.ramirez@gmail.com', 'carlos.ramirez@escuela.edu.mx', true);


--
-- Data for Name: grupo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.grupo OVERRIDING SYSTEM VALUE VALUES (1, 'S8A', 8, true);
INSERT INTO public.grupo OVERRIDING SYSTEM VALUE VALUES (2, 'S8V', 8, true);
INSERT INTO public.grupo OVERRIDING SYSTEM VALUE VALUES (3, 'S9A', 9, true);
INSERT INTO public.grupo OVERRIDING SYSTEM VALUE VALUES (4, 'S9V', 9, true);


--
-- Data for Name: materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.materia OVERRIDING SYSTEM VALUE VALUES (1, 'BD01', 'Bases de Datos', true);
INSERT INTO public.materia OVERRIDING SYSTEM VALUE VALUES (2, 'PW01', 'Programación Web', true);
INSERT INTO public.materia OVERRIDING SYSTEM VALUE VALUES (3, 'MAT01', 'Matemáticas', true);


--
-- Data for Name: periodo_escolar; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.periodo_escolar OVERRIDING SYSTEM VALUE VALUES (2, 'Agosto-Diciembre 2026', '2026-08-01', '2026-12-31', true);


--
-- Data for Name: registro_asistencia; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: salon; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (1, '1');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (2, '2');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (3, '3');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (4, '4');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (5, '5');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (6, '6');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (7, '7');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (8, '8');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (9, '9');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (10, '10');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (11, '11');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (12, '12');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (13, '13');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (14, '14');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (15, '15');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (16, '16');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (17, '17');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (18, '18');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (19, '19');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (20, '20');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (21, '21');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (22, '22');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (23, '23');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (24, '24');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (25, '25');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (26, '26');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (27, '27');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (28, '28');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (29, '29');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (30, '30');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (31, '31');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (32, '32');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (33, '33');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (34, '34');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (35, '35');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (36, '36');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (37, '37');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (38, '38');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (39, '39');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (40, '40');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (41, '41');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (42, '42');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (43, '43');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (44, '44');
INSERT INTO public.salon OVERRIDING SYSTEM VALUE VALUES (45, '45');


--
-- Data for Name: sesion_clase; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuario OVERRIDING SYSTEM VALUE VALUES (1, 'admin', 'PRUEBA_ADMIN', 'ADMINISTRADOR', true);
INSERT INTO public.usuario OVERRIDING SYSTEM VALUE VALUES (2, 'usuario1', 'PRUEBA_USUARIO', 'USUARIO', true);


--
-- Name: asignacion_clase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignacion_clase_id_seq', 8, true);


--
-- Name: docente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.docente_id_seq', 3, true);


--
-- Name: grupo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grupo_id_seq', 4, true);


--
-- Name: materia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materia_id_seq', 3, true);


--
-- Name: periodo_escolar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodo_escolar_id_seq', 2, true);


--
-- Name: registro_asistencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_asistencia_id_seq', 1, false);


--
-- Name: salon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salon_id_seq', 45, true);


--
-- Name: sesion_clase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sesion_clase_id_seq', 1, false);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_seq', 3, true);


--
-- Name: asignacion_clase asignacion_clase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT asignacion_clase_pkey PRIMARY KEY (id);


--
-- Name: docente docente_correo_institucional_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_correo_institucional_key UNIQUE (correo_institucional);


--
-- Name: docente docente_correo_personal_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_correo_personal_key UNIQUE (correo_personal);


--
-- Name: docente docente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_pkey PRIMARY KEY (id);


--
-- Name: docente docente_rfc_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_rfc_key UNIQUE (rfc);


--
-- Name: grupo grupo_clave_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_clave_key UNIQUE (clave);


--
-- Name: grupo grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_pkey PRIMARY KEY (id);


--
-- Name: materia materia_clave_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_clave_key UNIQUE (clave);


--
-- Name: materia materia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_pkey PRIMARY KEY (id);


--
-- Name: periodo_escolar periodo_escolar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodo_escolar
    ADD CONSTRAINT periodo_escolar_pkey PRIMARY KEY (id);


--
-- Name: registro_asistencia registro_asistencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT registro_asistencia_pkey PRIMARY KEY (id);


--
-- Name: salon salon_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salon
    ADD CONSTRAINT salon_numero_key UNIQUE (numero);


--
-- Name: salon salon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salon
    ADD CONSTRAINT salon_pkey PRIMARY KEY (id);


--
-- Name: sesion_clase sesion_clase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesion_clase
    ADD CONSTRAINT sesion_clase_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_username_key UNIQUE (username);


--
-- Name: asignacion_clase fk_asignacion_docente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_docente FOREIGN KEY (docente_id) REFERENCES public.docente(id);


--
-- Name: asignacion_clase fk_asignacion_grupo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_grupo FOREIGN KEY (grupo_id) REFERENCES public.grupo(id);


--
-- Name: asignacion_clase fk_asignacion_materia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_materia FOREIGN KEY (materia_id) REFERENCES public.materia(id);


--
-- Name: asignacion_clase fk_asignacion_periodo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_periodo FOREIGN KEY (periodo_id) REFERENCES public.periodo_escolar(id);


--
-- Name: asignacion_clase fk_asignacion_salon; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_salon FOREIGN KEY (salon_id) REFERENCES public.salon(id);


--
-- Name: registro_asistencia fk_asistencia_sesion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT fk_asistencia_sesion FOREIGN KEY (sesion_clase_id) REFERENCES public.sesion_clase(id);


--
-- Name: registro_asistencia fk_asistencia_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT fk_asistencia_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: sesion_clase fk_sesion_asignacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesion_clase
    ADD CONSTRAINT fk_sesion_asignacion FOREIGN KEY (asignacion_id) REFERENCES public.asignacion_clase(id);


--
-- PostgreSQL database dump complete
--

\unrestrict S67dUN9Pddfx8VHgIs5oQFax4nCpYXq7052Cb2csHXvTTHr8Mn0rVcK3Ojh53h2

