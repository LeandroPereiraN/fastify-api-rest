import { AuthorizedError, NotFoundError } from "../models/errors.ts";
import { User } from "../types/User.ts";
import UserRepository from "./user-repository.ts";

class AuthRepository {
  static async login(username: string, password: string): Promise<User> {
    const user = await UserRepository.getUserByUsername(username);
    if (!user || !user.id_usuario) throw new NotFoundError("Usuario no encontrado");

    const isAuthenticated = await UserRepository.authenticate(username, password);
    if (!isAuthenticated) throw new AuthorizedError("Contraseña incorrecta");

    return user as User;
  }
}

export default AuthRepository;
