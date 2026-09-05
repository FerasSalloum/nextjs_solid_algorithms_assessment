import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "../../../src/application/services/UserService";
import { createMockUserRepository } from "@tests/unit/mocks/mockRepositories";
import {
  mockAdminUser,
  mockManagerUser,
  mockMemberUser,
} from "@tests/unit/mocks/mockData";
import { Role } from "@prisma/client";
import { IHashService } from "../../../src/domain/interfaces/IHashService";
import { ITokenService } from "../../../src/domain/interfaces/ITokenService";

describe("UserService - Unit Tests", () => {
  let userRepository: ReturnType<typeof createMockUserRepository>;
  let hashService: IHashService;
  let tokenService: ITokenService;
  let userService: UserService;

  beforeEach(() => {
    userRepository = createMockUserRepository();

    hashService = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    tokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
    };

    userService = new UserService(userRepository, hashService, tokenService);

    vi.clearAllMocks();
  });
  //   اختبار الدالة الاولى انشاء حساب جديد
  describe("register", () => {
    it("انشاء مستخدم جديد تشفير كلمة المرور و انشاء التوكين", async () => {
      const mockToken = "mocked.jwt.token";
      const hashedPassword = "hashedPassword123";

      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(hashService.hash).mockResolvedValue(hashedPassword);
      vi.mocked(userRepository.create).mockResolvedValue(mockMemberUser);
      vi.mocked(tokenService.generateToken).mockResolvedValue(mockToken);

      const registrationData = {
        name: mockMemberUser.name,
        email: mockMemberUser.email,
        passwordRaw: "Password123!",
      };

      const result = await userService.register(registrationData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registrationData.email,
      );
      expect(hashService.hash).toHaveBeenCalledWith("Password123!");
      expect(userRepository.create).toHaveBeenCalledWith({
        name: registrationData.name,
        email: registrationData.email,
        passwordHash: hashedPassword,
        role: Role.MEMBER,
      });
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        userId: mockMemberUser.id,
        email: mockMemberUser.email,
        name: mockMemberUser.name,
        role: mockMemberUser.role,
      });
      expect(result).toEqual({ user: mockMemberUser, token: mockToken });
    });

    it("خطاء اذا كان البريد الالكتروني مستخدم بالفعل ", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockMemberUser);

      await expect(
        userService.register({
          name: "مستخدم مكرر",
          email: mockMemberUser.email,
          passwordRaw: "Password123!",
        }),
      ).rejects.toThrow("البريد الإلكتروني مستخدم بالفعل");

      expect(hashService.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });
  });
  //   اختبار الدالة الثانية تسجيل الدخول
  describe("login", () => {
    it("يجب أن ينهي تسجيل الدخول ويولد توكن جديد عند صحة البيانات", async () => {
      const mockToken = "mocked.jwt.token";

      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockMemberUser);
      vi.mocked(hashService.compare).mockResolvedValue(true);
      vi.mocked(tokenService.generateToken).mockResolvedValue(mockToken);

      const result = await userService.login(
        mockMemberUser.email,
        "Password123!",
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        mockMemberUser.email,
      );
      expect(hashService.compare).toHaveBeenCalledWith(
        "Password123!",
        mockMemberUser.passwordHash,
      );
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        userId: mockMemberUser.id,
        email: mockMemberUser.email,
        name: mockMemberUser.name,
        role: mockMemberUser.role,
      });
      expect(result).toEqual({ user: mockMemberUser, token: mockToken });
    });

    it("خطاء البريد الالكتروني غير موجود", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(
        userService.login("notfound@example.com", "Password123!"),
      ).rejects.toThrow("كلمة المرور او البريد الالكتروني خطاء");

      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it("خطاء البريد الالكتروني غير موجود", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockMemberUser);
      vi.mocked(hashService.compare).mockResolvedValue(false);

      await expect(
        userService.login(mockMemberUser.email, "WrongPassword"),
      ).rejects.toThrow("كلمة المرور او البريد الالكتروني خطاء");

      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });
  });
  //   اختبار الدالة الثالثة تحديث بيانات المستخدم
  describe("updateUser", () => {
    it("يسمح للمشرف بتحديث بيانات اي مستخدم", async () => {
      vi.mocked(userRepository.update).mockResolvedValue({
        ...mockMemberUser,
        name: "اسم جديد",
      });

      const result = await userService.updateUser(
        mockAdminUser.id,
        Role.ADMIN,
        mockMemberUser.id,
        Role.MEMBER,
        { name: "اسم جديد" },
      );

      expect(userRepository.update).toHaveBeenCalledWith(mockMemberUser.id, {
        name: "اسم جديد",
      });
      expect(result.name).toBe("اسم جديد");
    });

    it("يسمح للمدير بتعديل بيانات الاعضاء ", async () => {
      vi.mocked(userRepository.update).mockResolvedValue(mockMemberUser);

      const updateData = { name: "اسم معدل", role: Role.ADMIN };

      await userService.updateUser(
        mockManagerUser.id,
        Role.MANAGER,
        mockMemberUser.id,
        Role.MEMBER,
        updateData,
      );

      expect(userRepository.update).toHaveBeenCalledWith(mockMemberUser.id, {
        name: "اسم معدل",
      });
    });

    it("لا يسمح للمدير بتعديل بيانات المدراء او المشرفين", async () => {
      await expect(
        userService.updateUser(
          mockManagerUser.id,
          Role.MANAGER,
          mockAdminUser.id,
          Role.ADMIN,
          { name: "تعديل محظور" },
        ),
      ).rejects.toThrow(
        "صلاحيات غير كافية: لا يحق لك تعديل بيانات مدير آخر أو مسؤول (Admin)",
      );

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("يسمح للعضو بتعديل اسمه الشخصي فقط", async () => {
      vi.mocked(userRepository.update).mockResolvedValue({
        ...mockMemberUser,
        name: "تعديل حسابي",
      });

      await userService.updateUser(
        mockMemberUser.id,
        Role.MEMBER,
        mockMemberUser.id,
        Role.MEMBER,
        { name: "تعديل حسابي", email: "newmail@example.com" },
      );

      expect(userRepository.update).toHaveBeenCalledWith(mockMemberUser.id, {
        name: "تعديل حسابي",
      });
    });

    it("لا يسمح للعضو بتعديل بيانات المستخدمين آخرين", async () => {
      await expect(
        userService.updateUser(
          mockMemberUser.id,
          Role.MEMBER,
          "other-user-id",
          Role.MEMBER,
          { name: "محاولة اختراق" },
        ),
      ).rejects.toThrow(
        "صلاحيات غير كافية: لا يمكنك تعديل بيانات مستخدمين آخرين",
      );

      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  //   جلب المستخدمين بحسب الصلاحيات
  describe("getUsersByRole", () => {
    it("يجب أن يجلب قائمة المستخدمين بحسب الرتبة المطلوبة", async () => {
      const mockManagers = [mockManagerUser];
      vi.mocked(userRepository.findByRole).mockResolvedValue(mockManagers);

      const result = await userService.getUsersByRole(Role.MANAGER);

      expect(userRepository.findByRole).toHaveBeenCalledWith(Role.MANAGER);
      expect(result).toEqual(mockManagers);
    });
  });
});
