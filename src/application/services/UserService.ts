import { IUserRepository } from "@/src/domain/interfaces/IUserRepository";
import { User, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async register(data: {
    name: string;
    email: string;
    passwordRaw: string;
  }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error("البريد الإلكتروني مستخدم بالفعل");

    const passwordHash = await bcrypt.hash(data.passwordRaw, 10);

    return this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      //المسؤلية الافتراضية للمستخدم
      role: Role.MEMBER,
    });
  }

  async login(email: string, passwordRaw: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("كلمة المرور او البريد الالكتروني خطاء");

    const isPasswordValid = await bcrypt.compare(
      passwordRaw,
      user.passwordHash,
    );
    if (!isPasswordValid)
      throw new Error("كلمة المرور او البريد الالكتروني خطاء");

    return user;
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
}
