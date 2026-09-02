import bcrypt from "bcryptjs";
import { IHashService } from "../../domain/interfaces/IHashService";

export class BcryptHashService implements IHashService {
  private readonly saltRounds: number = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}