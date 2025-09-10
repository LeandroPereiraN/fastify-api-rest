import { AuthorizedError, NotFoundError } from "../models/errors.ts";
import { User } from "../types/User.ts";
import UserRepository from "./user-repository.ts";

class AuthRepository {
  static async login(username: string, password: string): Promise<User> {
    const user = UserRepository.getUserByUsername(username);
    if (!user || !user.id_usuario) throw new NotFoundError("Usuario no encontrado");

    const userPassword = await UserRepository.getCredentialByUserId(user.id_usuario);
    if (!userPassword || userPassword.password !== password) throw new AuthorizedError("Contraseña incorrecta");

    return user as User;
  }
}

export default AuthRepository;
