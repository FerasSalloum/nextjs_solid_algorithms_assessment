import { Role } from "@prisma/client";

export interface ITokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export interface ITokenService {
  generateToken(payload: ITokenPayload, expiresIn?: string): Promise<string>;
  verifyToken(token: string): Promise<ITokenPayload | null>;
}