import { NotFoundError } from "../models/errors.ts";
import { Credencial, Rol, User } from "../types/User.ts";

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

class UserRepository {
  static getUsers = () => {
    return users;
  }

  static getUserById = (id_usuario: number) => {
    return users.find(user => user.id_usuario === id_usuario);
  }

  static getUsersByName = (nombres: string) => {
    return users.filter(user => user.nombres?.toLowerCase().includes(nombres.toLowerCase()));
  }

  static getUserByUsername = (username: string) => {
    return users.find(user => user.username === username);
  }

  static async getCredentialByUserId(id_usuario: number): Promise<{ id_usuario: number; password: string } | null> {
    const password = passwords.find(p => p.id_usuario === id_usuario);
    if (!password) return null;

    return { id_usuario: password.id_usuario, password: password.password_hash };
  }

  static createUser = (user: Omit<User, "id_usuario">) => {
    usersCount++;
    const newUser = {
      id_usuario: usersCount,
      ...user
    }

    users.push(newUser);
    return newUser;
  }

  static updateUser = (id_usuario: number, newUser: Partial<Omit<User, "id_usuario">>) => {
    const user = this.getUserById(id_usuario);
    if (user) {
      Object.assign(user, newUser);
      return user;
    }

    throw new NotFoundError();
  }

  static deleteUser = (id_usuario: number) => {
    const userIndex = users.findIndex(user => user.id_usuario === id_usuario);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      return true;
    }
    return false;
  }
}

export default UserRepository;
