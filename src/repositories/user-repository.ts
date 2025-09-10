import { query } from "../db/db.ts";
import { NotFoundError } from "../models/errors.ts";
import { User } from "../types/User.ts";
/*
const roles: Rol[] = [
  { id_rol: 1, nombre: 'admin' },
  { id_rol: 2, nombre: 'user' },
  { id_rol: 3, nombre: 'guest' }
];

const passwords: Credencial[] = [
  {
    id_usuario: 1,
    password_hash: 'contraseña'
  },
  {
    id_usuario: 2,
    password_hash: 'contraseña'
  },
  {
    id_usuario: 3,
    password_hash: 'contraseña'
  }
];

const users: Partial<User>[] = [
  {
    id_usuario: 1,
    username: 'admin',
    email: 'admin@example.com',
    activo: true,
    fecha_nacimiento: '1980-01-01',
    nombres: 'Admin',
    apellidos: 'Principal',
    edad: 45,
    sexo: 'M',
    roles: [roles[0], roles[1]]
  },
  {
    id_usuario: 2,
    username: 'usuario1',
    email: 'user1@example.com',
    activo: true,
    fecha_nacimiento: '1995-05-10',
    nombres: 'Usuario',
    apellidos: 'Uno',
    edad: 30,
    sexo: 'F',
    roles: [roles[1]]
  },
  {
    id_usuario: 3,
    username: 'usuario2',
    email: 'user2@example.com',
    activo: false,
    fecha_nacimiento: '2000-03-15',
    nombres: 'Usuario',
    apellidos: 'Dos',
    edad: 25,
    sexo: 'M',
    roles: [roles[2]]
  }
]
let usersCount = users.length;
*/ //Hardcodeado , ahora usamos la db

class UserRepository {
  static async authenticate(username: string, password: string): Promise<User | null> {
  const sqlAuth = `
    SELECT U.*, array_agg(R.nombre) AS roles
    FROM usuarios U
    JOIN credenciales C ON C.id_usuario = U.id_usuario
    JOIN usuarios_roles UR ON UR.id_usuario = U.id_usuario
    JOIN roles R ON R.id_rol = UR.id_rol
    WHERE U.username = $1
      AND C.password_hash = crypt($2, C.password_hash)
    GROUP BY U.id_usuario
  `;

  const { rows: users } = await query(sqlAuth, [username, password]);
  return users[0] || null;
  }

  static async getUsers(): Promise<User[]> {
  const sqlGetUsers = `
    SELECT U.*, array_agg(R.nombre) AS roles
    FROM usuarios U
    JOIN usuarios_roles UR ON UR.id_usuario = U.id_usuario
    JOIN roles R ON R.id_rol = UR.id_rol
    GROUP BY U.id_usuario
  `;

  const { rows: users } = await query(sqlGetUsers);
  return users;
  }

  static async getUserById(id_usuario: number): Promise<User | null> {
  const sqlUserById = `
    SELECT U.*, array_agg(R.nombre) AS roles
    FROM usuarios U
    JOIN usuarios_roles UR ON UR.id_usuario = U.id_usuario
    JOIN roles R ON R.id_rol = UR.id_rol
    WHERE U.id_usuario = $1
    GROUP BY U.id_usuario
  `;

  const { rows: users } = await query(sqlUserById, [id_usuario]);
  return users[0] || null;
  }

  static async getUsersByName(nombres: string): Promise<User[]> {
  const sqlGetUserName = `
    SELECT U.*, array_agg(R.nombre) AS roles
    FROM usuarios U
    LEFT JOIN usuarios_roles UR ON UR.id_usuario = U.id_usuario
    LEFT JOIN roles R ON R.id_rol = UR.id_rol
    WHERE LOWER(U.nombres) LIKE LOWER($1)
    GROUP BY U.id_usuario
  `;
  const { rows: users } = await query(sqlGetUserName, [`%${nombres}%`]);
  return users;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const sqlGetUsername = `
      SELECT U.*, array_agg(R.nombre) AS roles
      FROM usuarios U
      JOIN usuarios_roles UR ON UR.id_usuario = U.id_usuario
      JOIN roles R ON R.id_rol = UR.id_rol
      WHERE U.username = $1
      GROUP BY U.id_usuario
    `;
    const { rows : users } = await query(sqlGetUsername, [username]);
    return users[0] || null;
  }

  static async getCredentialByUserId(id_usuario: number): Promise<Credential | null> {
    const sqlCredByUserId = `
      SELECT id_usuario, password_hash
      FROM credenciales
      WHERE id_usuario = $1
    `;
    const { rows: users } = await query(sqlCredByUserId, [id_usuario]);
    return users[0] || null;
  }

  static async createUser(
    user: Omit<User, "id_usuario" | "fecha_registro" | "reputacion" | "roles"> & { password: string }
  ): Promise<User> {
    try {
      await query("BEGIN");

      const insertUserSQL = `
        INSERT INTO usuarios
          (username, email, activo, fecha_nacimiento, nombres, apellidos, edad, sexo, foto_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id_usuario
      `;

      const { rows: inserted } = await query(insertUserSQL, [
        user.username,
        user.email,
        user.activo ?? false,
        user.fecha_nacimiento,
        user.nombres,
        user.apellidos,
        user.edad,
        user.sexo,
        user.foto_url ?? null
      ]);

      const id_usuario = inserted[0].id_usuario;

      await query( // credenciales
        `INSERT INTO credenciales (id_usuario, password_hash)
        VALUES ($1, crypt($2, gen_salt('bf')))`,
        [id_usuario, user.password]
      );

      await query(// rol por defecto
        `INSERT INTO usuarios_roles (id_usuario, id_rol)
        SELECT $1, id_rol FROM roles WHERE nombre = 'user'`,
        [id_usuario]
      );

      await query("COMMIT");
      return (await this.getUserById(id_usuario))!;
    } catch (err) {
      await query("ROLLBACK");
      throw err;
    }
  }


  static async updateUser(id_usuario: number, newUser: Partial<User>): Promise<User> {
    const fields = Object.keys(newUser);
    if (!fields.length) throw new NotFoundError();

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = Object.values(newUser);

    const sqlUpdateUser = `
      UPDATE usuarios
      SET ${setClause}
      WHERE id_usuario = $${fields.length + 1}
      RETURNING *
    `;

    const { rows: users } = await query(sqlUpdateUser, [...values, id_usuario]);
    if (!users[0]) throw new NotFoundError();

    return users[0];
  }

  static async deleteUser(id_usuario: number): Promise<boolean> {
    const { rowCount } = await query(
      `DELETE FROM usuarios WHERE id_usuario = $1`,
      [id_usuario]
    );
    return rowCount > 0;
  }
}

export default UserRepository;
