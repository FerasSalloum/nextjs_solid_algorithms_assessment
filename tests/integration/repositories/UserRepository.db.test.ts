import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { UserRepository } from "@/src/infrastructure/repositories/UserRepository";
import { mockAdminUser, mockMemberUser } from "@/tests/unit/mocks/mockData";
import { Role } from "@prisma/client";

describe("UserRepository - Real Database Integration Test", () => {
  const userRepository = new UserRepository();

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. اختبار إنشاء مستخدم جديد
  describe("create", () => {
    it("يحفظ المستخدما ويرجع بياناته كاملة", async () => {
      const createdUser = await userRepository.create(mockMemberUser);

      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toBe(mockMemberUser.email);
      expect(createdUser.name).toBe(mockMemberUser.name);
      expect(createdUser.role).toBe(mockMemberUser.role);

      const dbUser = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });
      expect(dbUser).not.toBeNull();
    });
  });

  // 2. اختبار البحث بواسطة المعرف
  describe("findById", () => {
    it("يرجع المستخدم الصحيح عند تمرير المعرف", async () => {
      await prisma.user.create({
        data: mockMemberUser,
      });

      const foundUser = await userRepository.findById(mockMemberUser.id);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(mockMemberUser.id);
      expect(foundUser?.email).toBe(mockMemberUser.email);
    });

    it("يرجع قيمة فارغة عند البحث بمعرف غير موجود", async () => {
      const foundUser = await userRepository.findById("non-existent-id-123");
      expect(foundUser).toBeNull();
    });
  });

  // 3. اختبار البحث بواسطة البريد الإلكتروني
  describe("findByEmail", () => {
    it("يرجع المستخدم بستخدام بريد إلكتروني مسجل", async () => {
      await prisma.user.create({
        data: mockMemberUser,
      });

      const foundUser = await userRepository.findByEmail(mockMemberUser.email);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe(mockMemberUser.email);
    });

    it(" يرجع قيمة فارغة عند استخدام بريد إلكتروني غير مسجل", async () => {
      const foundUser = await userRepository.findByEmail(
        "notfound@example.com",
      );
      expect(foundUser).toBeNull();
    });
  });

  // 4. اختبار البحث بواسطة الدور
  describe("findByRole", () => {
    it("يرجع  كافة المستخدمين الذين يمتلكون دوراً معيناً", async () => {
      await Promise.all([
        prisma.user.create({
          data: mockMemberUser,
        }),
        prisma.user.create({
          data: {
            ...mockMemberUser,
            id: "member-2",
            email: "member2@example.com",
          },
        }),
        prisma.user.create({
          data: mockAdminUser,
        }),
      ]);
      const members = await userRepository.findByRole(Role.MEMBER);
      const admins = await userRepository.findByRole(Role.ADMIN);

      expect(members).toHaveLength(2);
      expect(members.every((user) => user.role === Role.MEMBER)).toBe(true);

      expect(admins).toHaveLength(1);
      expect(admins[0].email).toBe(mockAdminUser.email);
    });

    it("يرجع مصفوفة فارغة إذا لم يوجد مستخدمون بالدور المطلوب", async () => {
      const managers = await userRepository.findByRole(Role.MANAGER);
      expect(managers).toEqual([]);
    });
  });

  // 5. اختبار التحديث
  describe("update", () => {
    it("يكتفي بتحديث الحقول المحددة فقط للمستخدم", async () => {
      await prisma.user.create({
        data: mockMemberUser,
      });

      const updatedUser = await userRepository.update(mockMemberUser.id, {
        name: "اسم جديد مُعدل",
      });

      expect(updatedUser.name).toBe("اسم جديد مُعدل");
      expect(updatedUser.email).toBe(mockMemberUser.email);

      const dbUser = await prisma.user.findUnique({
        where: { id: mockMemberUser.id },
      });
      expect(dbUser?.name).toBe("اسم جديد مُعدل");
    });
  });

  // 6. اختبار الحذف
  describe("delete", () => {
    it("يحذف المستخدم بنجاح", async () => {
      await prisma.user.create({
        data: mockMemberUser,
      });

      await userRepository.delete(mockMemberUser.id);

      const deletedUser = await prisma.user.findUnique({
        where: { id: mockMemberUser.id },
      });
      expect(deletedUser).toBeNull();
    });
  });
});
