--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';


--
-- Name: asignacion_clase; Type: TABLE; Schema: public; Owner: -
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
    color character varying(7) DEFAULT '#1558c7'::character varying NOT NULL,
    CONSTRAINT asignacion_dia_valido CHECK (((dia_semana >= 1) AND (dia_semana <= 7))),
    CONSTRAINT asignacion_horario_valido CHECK ((hora_fin > hora_inicio))
);


--
-- Name: asignacion_clase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: docente; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: docente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: grupo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grupo (
    id integer NOT NULL,
    clave character varying(20) NOT NULL,
    semestre smallint NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: grupo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: materia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materia (
    id integer NOT NULL,
    clave character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: materia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: periodo_escolar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.periodo_escolar (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT periodo_fechas_validas CHECK ((fecha_fin > fecha_inicio))
);


--
-- Name: periodo_escolar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: registro_asistencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registro_asistencia (
    id integer NOT NULL,
    sesion_clase_id integer NOT NULL,
    usuario_id integer NOT NULL,
    estado character varying(10) NOT NULL,
    observaciones character varying(500),
    CONSTRAINT asistencia_estado_valido CHECK (((estado)::text = ANY (ARRAY[('PRESENTE'::character varying)::text, ('AUSENTE'::character varying)::text, ('RETARDO'::character varying)::text]))),
    CONSTRAINT chk_registro_estado CHECK (((estado)::text = ANY (ARRAY[('PRESENTE'::character varying)::text, ('AUSENTE'::character varying)::text, ('RETARDO'::character varying)::text])))
);


--
-- Name: registro_asistencia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: salon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon (
    id integer NOT NULL,
    numero character varying(10) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: salon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: sesion_clase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesion_clase (
    id integer NOT NULL,
    asignacion_id integer NOT NULL,
    fecha date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    CONSTRAINT sesion_horario_valido CHECK ((hora_fin > hora_inicio))
);


--
-- Name: sesion_clase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(20) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT usuario_rol_valido CHECK (((rol)::text = ANY (ARRAY[('ADMINISTRADOR'::character varying)::text, ('USUARIO'::character varying)::text])))
);


--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: asignacion_clase asignacion_clase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT asignacion_clase_pkey PRIMARY KEY (id);


--
-- Name: docente docente_correo_institucional_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_correo_institucional_key UNIQUE (correo_institucional);


--
-- Name: docente docente_correo_personal_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_correo_personal_key UNIQUE (correo_personal);


--
-- Name: docente docente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_pkey PRIMARY KEY (id);


--
-- Name: docente docente_rfc_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_rfc_key UNIQUE (rfc);


--
-- Name: grupo grupo_clave_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_clave_key UNIQUE (clave);


--
-- Name: grupo grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_pkey PRIMARY KEY (id);


--
-- Name: materia materia_clave_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_clave_key UNIQUE (clave);


--
-- Name: materia materia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_pkey PRIMARY KEY (id);


--
-- Name: periodo_escolar periodo_escolar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodo_escolar
    ADD CONSTRAINT periodo_escolar_pkey PRIMARY KEY (id);


--
-- Name: registro_asistencia registro_asistencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT registro_asistencia_pkey PRIMARY KEY (id);


--
-- Name: salon salon_numero_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon
    ADD CONSTRAINT salon_numero_key UNIQUE (numero);


--
-- Name: salon salon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon
    ADD CONSTRAINT salon_pkey PRIMARY KEY (id);


--
-- Name: sesion_clase sesion_clase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_clase
    ADD CONSTRAINT sesion_clase_pkey PRIMARY KEY (id);


--
-- Name: registro_asistencia uq_registro_sesion_usuario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT uq_registro_sesion_usuario UNIQUE (sesion_clase_id, usuario_id);


--
-- Name: sesion_clase uq_sesion_asignacion_fecha; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_clase
    ADD CONSTRAINT uq_sesion_asignacion_fecha UNIQUE (asignacion_id, fecha);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_username_key UNIQUE (username);


--
-- Name: asignacion_clase fk_asignacion_docente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_docente FOREIGN KEY (docente_id) REFERENCES public.docente(id);


--
-- Name: asignacion_clase fk_asignacion_grupo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_grupo FOREIGN KEY (grupo_id) REFERENCES public.grupo(id);


--
-- Name: asignacion_clase fk_asignacion_materia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_materia FOREIGN KEY (materia_id) REFERENCES public.materia(id);


--
-- Name: asignacion_clase fk_asignacion_periodo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_periodo FOREIGN KEY (periodo_id) REFERENCES public.periodo_escolar(id);


--
-- Name: asignacion_clase fk_asignacion_salon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_clase
    ADD CONSTRAINT fk_asignacion_salon FOREIGN KEY (salon_id) REFERENCES public.salon(id);


--
-- Name: registro_asistencia fk_asistencia_sesion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT fk_asistencia_sesion FOREIGN KEY (sesion_clase_id) REFERENCES public.sesion_clase(id);


--
-- Name: registro_asistencia fk_asistencia_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT fk_asistencia_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: sesion_clase fk_sesion_asignacion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_clase
    ADD CONSTRAINT fk_sesion_asignacion FOREIGN KEY (asignacion_id) REFERENCES public.asignacion_clase(id);


--
-- PostgreSQL database dump complete
--


