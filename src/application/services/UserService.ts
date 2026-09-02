import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { IHashService } from "../../domain/interfaces/IHashService";
import { ITokenService } from "../../domain/interfaces/ITokenService";
import { User, Role } from "@prisma/client";

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private tokenService: ITokenService,
  ) {}

  async register(data: {
    name: string;
    email: string;
    passwordRaw: string;
  }): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error("البريد الإلكتروني مستخدم بالفعل");

    const passwordHash = await this.hashService.hash(data.passwordRaw);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.MEMBER,
    });
    const token = await this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return { user, token };
  }

  async login(
    email: string,
    passwordRaw: string,
  ): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("كلمة المرور او البريد الالكتروني خطاء");

    const isPasswordValid = await this.hashService.compare(
      passwordRaw,
      user.passwordHash,
    );
    if (!isPasswordValid)
      throw new Error("كلمة المرور او البريد الالكتروني خطاء");

    const token = await this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { user, token };
  }

  async logout(): Promise<boolean> {
    return true;
  }

  async updateUser(
    executorId: string,
    executorRole: Role,
    targetUserId: string,
    targetUserRole: Role,
    updateData: Partial<Omit<User, "id" | "createdAt">>,
  ): Promise<User> {
    if (executorRole === Role.ADMIN) {
      return this.userRepository.update(targetUserId, updateData);
    }

    if (executorRole === Role.MANAGER) {
      if (targetUserRole === Role.ADMIN || targetUserRole === Role.MANAGER) {
        throw new Error(
          "صلاحيات غير كافية: لا يحق لك تعديل بيانات مدير آخر أو مسؤول (Admin)",
        );
      }

      if (updateData.role) {
        delete updateData.role;
      }
      return this.userRepository.update(targetUserId, updateData);
    }

    if (executorRole === Role.MEMBER) {
      if (executorId !== targetUserId) {
        throw new Error(
          "صلاحيات غير كافية: لا يمكنك تعديل بيانات مستخدمين آخرين",
        );
      }

      const restrictedData = { name: updateData.name };

      return this.userRepository.update(targetUserId, restrictedData);
    }

    throw new Error("دور غير معروف");
  }

  async getUsersByRole(role: Role): Promise<User[]> {
    return this.userRepository.findByRole(role);
  }
}
