import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { IHashService } from "../../domain/interfaces/IHashService";
import { User, Role } from "@prisma/client";
import {
  ConflictError,
  ForbiddenError,
  AppError,
} from "@/src/domain/errors/AppError";

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
  ) {}

  // عملية التسجيل أصبحت تنشئ المستخدم وترجع كائن المستخدم فقط بدون توكن
  async register(data: {
    name: string;
    email: string;
    passwordRaw: string;
  }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("البريد الإلكتروني مستخدم بالفعل");
    }

    const passwordHash = await this.hashService.hash(data.passwordRaw);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.MEMBER,
    });

    return user;
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
        throw new ForbiddenError(
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
        throw new ForbiddenError(
          "صلاحيات غير كافية: لا يمكنك تعديل بيانات مستخدمين آخرين",
        );
      }

      const restrictedData = { name: updateData.name };

      return this.userRepository.update(targetUserId, restrictedData);
    }

    throw new AppError("دور غير معروف", 400);
  }

  async getUsersByRole(role: Role): Promise<User[]> {
    return this.userRepository.findByRole(role);
  }
}
