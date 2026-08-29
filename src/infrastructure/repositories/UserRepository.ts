import { prisma } from "@/src/lib/prisma";
import { IUserRepository } from "@/src/domain/interfaces/IUserRepository";
import { User, Role } from "@prisma/client";

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: { name: string; email: string; passwordHash: string; role?: Role }): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}