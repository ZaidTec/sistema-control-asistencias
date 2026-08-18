--
-- PostgreSQL database dump
--

\restrict rWYxv8a8XJUNm4aWd9a9Xc6HXhGKf6wf3eHipaCYTlXDHe70kFPnRfsaH7LwpW3

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
    CONSTRAINT asistencia_estado_valido CHECK (((estado)::text = ANY (ARRAY[('PRESENTE'::character varying)::text, ('AUSENTE'::character varying)::text, ('RETARDO'::character varying)::text]))),
    CONSTRAINT chk_registro_estado CHECK (((estado)::text = ANY (ARRAY[('PRESENTE'::character varying)::text, ('AUSENTE'::character varying)::text, ('RETARDO'::character varying)::text])))
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
    numero character varying(10) NOT NULL,
    activo boolean DEFAULT true NOT NULL
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
    CONSTRAINT usuario_rol_valido CHECK (((rol)::text = ANY (ARRAY[('ADMINISTRADOR'::character varying)::text, ('USUARIO'::character varying)::text])))
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

COPY public.asignacion_clase (id, docente_id, materia_id, grupo_id, salon_id, periodo_id, dia_semana, hora_inicio, hora_fin, activo) FROM stdin;
5	1	1	1	12	2	1	07:00:00	09:00:00	t
6	1	2	2	15	2	3	10:00:00	12:00:00	t
7	2	3	3	20	2	1	09:00:00	11:00:00	t
8	3	1	4	25	2	2	08:00:00	10:00:00	t
10	5	3	3	10	2	3	08:00:00	10:00:00	t
11	5	5	1	35	2	5	21:00:00	23:00:00	f
12	5	5	4	41	2	1	21:00:00	23:20:00	f
13	6	1	3	13	2	1	23:00:00	23:59:00	t
14	1	1	1	12	2	2	06:00:00	06:30:00	f
15	6	5	1	7	2	2	00:00:00	02:00:00	t
16	1	1	1	12	2	3	06:00:00	06:30:00	f
17	5	2	4	8	2	2	00:55:00	02:00:00	t
\.


--
-- Data for Name: docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.docente (id, nombre, apellido_p, apellido_m, rfc, telefono, correo_personal, correo_institucional, activo) FROM stdin;
2	Maria	Gonzalez	Hernandez	GOHM850505XYZ	5552345678	maria.gonzalez@gmail.com	maria.gonzalez@escuela.edu.mx	t
1	Juan Carlos	Perez	Lopez	PELJ900101ABC	5551234567	juan.perez@gmail.com	juan.perez@escuela.edu.mx	t
3	Carlos	Ramirez	Martinez	RAMC920808DEF	5553456789	carlos.ramirez@gmail.com	carlos.ramirez@escuela.edu.mx	f
5	Orquidea 	Acevedo 	Calderón	asdfggjjg0909	55443322111	orquidea@gmail.com	orquidea@sistemas.tecnm.mx	t
6	Test	A	B	ABC123	1	x@x.com	y@y.com	t
\.


--
-- Data for Name: grupo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grupo (id, clave, semestre, activo) FROM stdin;
1	S8A	8	t
2	S8V	8	t
3	S9A	9	t
4	S9V	9	t
\.


--
-- Data for Name: materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materia (id, clave, nombre, activo) FROM stdin;
1	BD01	Bases de Datos	t
2	PW01	Programación Web	t
3	PRO101	Programación Web y Desarrollo	t
4	SDC1011	Ingenieria de software	t
5	ASDAS	Prueba usuario	t
\.


--
-- Data for Name: periodo_escolar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.periodo_escolar (id, nombre, fecha_inicio, fecha_fin, activo) FROM stdin;
2	Agosto-Diciembre 2026	2026-08-01	2026-12-31	t
\.


--
-- Data for Name: registro_asistencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_asistencia (id, sesion_clase_id, usuario_id, estado, observaciones) FROM stdin;
3	70	1	PRESENTE	\N
4	224	1	AUSENTE	\N
5	158	1	RETARDO	Trafico x2
\.


--
-- Data for Name: salon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salon (id, numero, activo) FROM stdin;
6	6	t
7	7	t
8	8	t
9	9	t
10	10	t
11	11	t
12	12	t
13	13	t
14	14	t
15	15	t
16	16	t
17	17	t
18	18	t
19	19	t
20	20	t
21	21	t
22	22	t
23	23	t
24	24	t
25	25	t
26	26	t
27	27	t
28	28	t
29	29	t
30	30	t
31	31	t
32	32	t
33	33	t
34	34	t
35	35	t
36	36	t
37	37	t
38	38	t
39	39	t
40	40	t
41	41	t
42	42	t
43	43	t
44	44	t
45	45	t
1	1	t
2	2	t
3	3	t
4	4	t
5	5	t
\.


--
-- Data for Name: sesion_clase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sesion_clase (id, asignacion_id, fecha, hora_inicio, hora_fin) FROM stdin;
1	13	2026-08-17	23:00:00	23:59:00
2	5	2026-08-03	07:00:00	09:00:00
3	5	2026-08-10	07:00:00	09:00:00
4	5	2026-08-17	07:00:00	09:00:00
5	5	2026-08-24	07:00:00	09:00:00
6	5	2026-08-31	07:00:00	09:00:00
7	5	2026-09-07	07:00:00	09:00:00
8	5	2026-09-14	07:00:00	09:00:00
9	5	2026-09-21	07:00:00	09:00:00
10	5	2026-09-28	07:00:00	09:00:00
11	5	2026-10-05	07:00:00	09:00:00
12	5	2026-10-12	07:00:00	09:00:00
13	5	2026-10-19	07:00:00	09:00:00
14	5	2026-10-26	07:00:00	09:00:00
15	5	2026-11-02	07:00:00	09:00:00
16	5	2026-11-09	07:00:00	09:00:00
17	5	2026-11-16	07:00:00	09:00:00
18	5	2026-11-23	07:00:00	09:00:00
19	5	2026-11-30	07:00:00	09:00:00
20	5	2026-12-07	07:00:00	09:00:00
21	5	2026-12-14	07:00:00	09:00:00
22	5	2026-12-21	07:00:00	09:00:00
23	5	2026-12-28	07:00:00	09:00:00
24	6	2026-08-05	10:00:00	12:00:00
25	6	2026-08-12	10:00:00	12:00:00
26	6	2026-08-19	10:00:00	12:00:00
27	6	2026-08-26	10:00:00	12:00:00
28	6	2026-09-02	10:00:00	12:00:00
29	6	2026-09-09	10:00:00	12:00:00
30	6	2026-09-16	10:00:00	12:00:00
31	6	2026-09-23	10:00:00	12:00:00
32	6	2026-09-30	10:00:00	12:00:00
33	6	2026-10-07	10:00:00	12:00:00
34	6	2026-10-14	10:00:00	12:00:00
35	6	2026-10-21	10:00:00	12:00:00
36	6	2026-10-28	10:00:00	12:00:00
37	6	2026-11-04	10:00:00	12:00:00
38	6	2026-11-11	10:00:00	12:00:00
39	6	2026-11-18	10:00:00	12:00:00
40	6	2026-11-25	10:00:00	12:00:00
41	6	2026-12-02	10:00:00	12:00:00
42	6	2026-12-09	10:00:00	12:00:00
43	6	2026-12-16	10:00:00	12:00:00
44	6	2026-12-23	10:00:00	12:00:00
45	6	2026-12-30	10:00:00	12:00:00
46	7	2026-08-03	09:00:00	11:00:00
47	7	2026-08-10	09:00:00	11:00:00
48	7	2026-08-17	09:00:00	11:00:00
49	7	2026-08-24	09:00:00	11:00:00
50	7	2026-08-31	09:00:00	11:00:00
51	7	2026-09-07	09:00:00	11:00:00
52	7	2026-09-14	09:00:00	11:00:00
53	7	2026-09-21	09:00:00	11:00:00
54	7	2026-09-28	09:00:00	11:00:00
55	7	2026-10-05	09:00:00	11:00:00
56	7	2026-10-12	09:00:00	11:00:00
57	7	2026-10-19	09:00:00	11:00:00
58	7	2026-10-26	09:00:00	11:00:00
59	7	2026-11-02	09:00:00	11:00:00
60	7	2026-11-09	09:00:00	11:00:00
61	7	2026-11-16	09:00:00	11:00:00
62	7	2026-11-23	09:00:00	11:00:00
63	7	2026-11-30	09:00:00	11:00:00
64	7	2026-12-07	09:00:00	11:00:00
65	7	2026-12-14	09:00:00	11:00:00
66	7	2026-12-21	09:00:00	11:00:00
67	7	2026-12-28	09:00:00	11:00:00
68	8	2026-08-04	08:00:00	10:00:00
69	8	2026-08-11	08:00:00	10:00:00
70	8	2026-08-18	08:00:00	10:00:00
71	8	2026-08-25	08:00:00	10:00:00
72	8	2026-09-01	08:00:00	10:00:00
73	8	2026-09-08	08:00:00	10:00:00
74	8	2026-09-15	08:00:00	10:00:00
75	8	2026-09-22	08:00:00	10:00:00
76	8	2026-09-29	08:00:00	10:00:00
77	8	2026-10-06	08:00:00	10:00:00
78	8	2026-10-13	08:00:00	10:00:00
79	8	2026-10-20	08:00:00	10:00:00
80	8	2026-10-27	08:00:00	10:00:00
81	8	2026-11-03	08:00:00	10:00:00
82	8	2026-11-10	08:00:00	10:00:00
83	8	2026-11-17	08:00:00	10:00:00
84	8	2026-11-24	08:00:00	10:00:00
85	8	2026-12-01	08:00:00	10:00:00
86	8	2026-12-08	08:00:00	10:00:00
87	8	2026-12-15	08:00:00	10:00:00
88	8	2026-12-22	08:00:00	10:00:00
89	8	2026-12-29	08:00:00	10:00:00
90	10	2026-08-05	08:00:00	10:00:00
91	10	2026-08-12	08:00:00	10:00:00
92	10	2026-08-19	08:00:00	10:00:00
93	10	2026-08-26	08:00:00	10:00:00
94	10	2026-09-02	08:00:00	10:00:00
95	10	2026-09-09	08:00:00	10:00:00
96	10	2026-09-16	08:00:00	10:00:00
97	10	2026-09-23	08:00:00	10:00:00
98	10	2026-09-30	08:00:00	10:00:00
99	10	2026-10-07	08:00:00	10:00:00
100	10	2026-10-14	08:00:00	10:00:00
101	10	2026-10-21	08:00:00	10:00:00
102	10	2026-10-28	08:00:00	10:00:00
103	10	2026-11-04	08:00:00	10:00:00
104	10	2026-11-11	08:00:00	10:00:00
105	10	2026-11-18	08:00:00	10:00:00
106	10	2026-11-25	08:00:00	10:00:00
107	10	2026-12-02	08:00:00	10:00:00
108	10	2026-12-09	08:00:00	10:00:00
109	10	2026-12-16	08:00:00	10:00:00
110	10	2026-12-23	08:00:00	10:00:00
111	10	2026-12-30	08:00:00	10:00:00
112	13	2026-08-03	23:00:00	23:59:00
113	13	2026-08-10	23:00:00	23:59:00
115	13	2026-08-24	23:00:00	23:59:00
116	13	2026-08-31	23:00:00	23:59:00
117	13	2026-09-07	23:00:00	23:59:00
118	13	2026-09-14	23:00:00	23:59:00
119	13	2026-09-21	23:00:00	23:59:00
120	13	2026-09-28	23:00:00	23:59:00
121	13	2026-10-05	23:00:00	23:59:00
122	13	2026-10-12	23:00:00	23:59:00
123	13	2026-10-19	23:00:00	23:59:00
124	13	2026-10-26	23:00:00	23:59:00
125	13	2026-11-02	23:00:00	23:59:00
126	13	2026-11-09	23:00:00	23:59:00
127	13	2026-11-16	23:00:00	23:59:00
128	13	2026-11-23	23:00:00	23:59:00
129	13	2026-11-30	23:00:00	23:59:00
130	13	2026-12-07	23:00:00	23:59:00
131	13	2026-12-14	23:00:00	23:59:00
132	13	2026-12-21	23:00:00	23:59:00
133	13	2026-12-28	23:00:00	23:59:00
156	15	2026-08-04	00:00:00	02:00:00
157	15	2026-08-11	00:00:00	02:00:00
158	15	2026-08-18	00:00:00	02:00:00
159	15	2026-08-25	00:00:00	02:00:00
160	15	2026-09-01	00:00:00	02:00:00
161	15	2026-09-08	00:00:00	02:00:00
162	15	2026-09-15	00:00:00	02:00:00
163	15	2026-09-22	00:00:00	02:00:00
164	15	2026-09-29	00:00:00	02:00:00
165	15	2026-10-06	00:00:00	02:00:00
166	15	2026-10-13	00:00:00	02:00:00
167	15	2026-10-20	00:00:00	02:00:00
168	15	2026-10-27	00:00:00	02:00:00
169	15	2026-11-03	00:00:00	02:00:00
170	15	2026-11-10	00:00:00	02:00:00
171	15	2026-11-17	00:00:00	02:00:00
172	15	2026-11-24	00:00:00	02:00:00
173	15	2026-12-01	00:00:00	02:00:00
174	15	2026-12-08	00:00:00	02:00:00
175	15	2026-12-15	00:00:00	02:00:00
176	15	2026-12-22	00:00:00	02:00:00
177	15	2026-12-29	00:00:00	02:00:00
222	17	2026-08-04	00:55:00	02:00:00
223	17	2026-08-11	00:55:00	02:00:00
224	17	2026-08-18	00:55:00	02:00:00
225	17	2026-08-25	00:55:00	02:00:00
226	17	2026-09-01	00:55:00	02:00:00
227	17	2026-09-08	00:55:00	02:00:00
228	17	2026-09-15	00:55:00	02:00:00
229	17	2026-09-22	00:55:00	02:00:00
230	17	2026-09-29	00:55:00	02:00:00
231	17	2026-10-06	00:55:00	02:00:00
232	17	2026-10-13	00:55:00	02:00:00
233	17	2026-10-20	00:55:00	02:00:00
234	17	2026-10-27	00:55:00	02:00:00
235	17	2026-11-03	00:55:00	02:00:00
236	17	2026-11-10	00:55:00	02:00:00
237	17	2026-11-17	00:55:00	02:00:00
238	17	2026-11-24	00:55:00	02:00:00
239	17	2026-12-01	00:55:00	02:00:00
240	17	2026-12-08	00:55:00	02:00:00
241	17	2026-12-15	00:55:00	02:00:00
242	17	2026-12-22	00:55:00	02:00:00
243	17	2026-12-29	00:55:00	02:00:00
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, username, password_hash, rol, activo) FROM stdin;
4	test_user	$2b$10$klJ3t2IU09N9FDE86ttPn.YtupOAQaDRQ/iiP.pxcJlIv.qUfQe.u	USUARIO	f
1	admin	$2b$10$0XMIwf2j90Nq8w9GWrRWROva4r3CRY6ZV7hokM5xTtehKe.kYj8e.	ADMINISTRADOR	t
2	usuario1	$2b$10$sCZoDJuL.QOzO.B/0nlFhuE5Pg79sE2rkVhE2hTsNrVORKHvgsmdG	USUARIO	t
\.


--
-- Name: asignacion_clase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignacion_clase_id_seq', 17, true);


--
-- Name: docente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.docente_id_seq', 8, true);


--
-- Name: grupo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grupo_id_seq', 4, true);


--
-- Name: materia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materia_id_seq', 5, true);


--
-- Name: periodo_escolar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodo_escolar_id_seq', 2, true);


--
-- Name: registro_asistencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_asistencia_id_seq', 5, true);


--
-- Name: salon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salon_id_seq', 45, true);


--
-- Name: sesion_clase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sesion_clase_id_seq', 243, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_seq', 4, true);


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
-- Name: registro_asistencia uq_registro_sesion_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_asistencia
    ADD CONSTRAINT uq_registro_sesion_usuario UNIQUE (sesion_clase_id, usuario_id);


--
-- Name: sesion_clase uq_sesion_asignacion_fecha; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesion_clase
    ADD CONSTRAINT uq_sesion_asignacion_fecha UNIQUE (asignacion_id, fecha);


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

\unrestrict rWYxv8a8XJUNm4aWd9a9Xc6HXhGKf6wf3eHipaCYTlXDHe70kFPnRfsaH7LwpW3

