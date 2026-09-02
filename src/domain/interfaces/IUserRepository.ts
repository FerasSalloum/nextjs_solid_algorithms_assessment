import { User, Role } from "@prisma/client";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: Role): Promise<User[]>;
  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }): Promise<User>;
  update(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt">>,
  ): Promise<User>;
  delete(id: string): Promise<void>;
}

