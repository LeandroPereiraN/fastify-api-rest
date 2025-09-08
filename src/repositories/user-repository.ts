import { NotFoundError } from "../models/errors.ts";
import { User } from "../types/User.ts";

const users: Partial<User>[] = [
  { id_usuario: 1, nombres: 'Jorge' },
  { id_usuario: 2, nombres: 'Alberto' },
  { id_usuario: 3, nombres: 'Juan' }
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
