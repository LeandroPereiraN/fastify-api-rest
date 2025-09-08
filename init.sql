-- Script solo váliddo para nuestro ambiente de desarrollo.
-- Tener en cuenta que al borrar y volver a crear la tabla, se pierden todos los datos
-- Pero con este propio script cargamos todos los datos iniciales.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DROP TYPE IF EXISTS SEXO_ENUM;
CREATE TYPE SEXO_ENUM AS ENUM ('M', 'F');

DROP TABLE IF EXISTS roles;
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL
);

DROP TABLE IF EXISTS usuarios;
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(15) NOT NULL UNIQUE,
    email CITEXT  NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    reputacion NUMERIC(5,2) DEFAULT 0,
    preferencias JSONB,   

    fecha_nacimiento DATE NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL, 
    edad SMALLINT NOT NULL,
    sexo SEXO_ENUM NOT NULL,
    foto_url VARCHAR(520)
);

-- Tabla con solo el hash
CREATE TABLE IF NOT EXISTS credenciales (
    id_usuario INTEGER NOT NULL PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    password_hash TEXT NOT NULL
)
;

DROP TABLE IF EXISTS usuarios_roles;
CREATE TABLE usuarios_roles (
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_rol INTEGER NOT NULL REFERENCES roles(id_rol) ON DELETE CASCADE,
  PRIMARY KEY (id_usuario, id_rol)
);

-- Dar de alta 1 admin y 2 usuarios normales.
WITH nuevos_usuarios AS (
  INSERT INTO usuarios (username, email, activo, fecha_nacimiento, nombres, apellidos, edad, sexo)
    VALUES 
    ('admin', 'admin@example.com', TRUE, '1980-01-01', 'Admin', 'Principal', 45, 'M'),
    ('usuario1', 'user1@example.com', TRUE, '1995-05-10', 'Usuario', 'Uno', 30, 'F'),
    ('usuario2', 'user2@example.com', FALSE, '2000-03-15', 'Usuario', 'Dos', 25, 'M')
  RETURNING id_usuario
)
INSERT INTO credenciales (id_usuario, password_hash)
SELECT id_usuario, crypt('contraseña', gen_salt('bf')) 
FROM nuevos_usuarios
;

-- Roles base
INSERT INTO roles (nombre) VALUES ('admin'), ('user');

-- Asignar admin solo al admin
INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u, roles r
WHERE u.username = 'admin' AND r.nombre = 'admin';

-- Asignar role user a todos.
INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u, roles r
WHERE r.nombre = 'user';
