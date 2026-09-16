import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "@/src/app/api/users/[id]/route";
import { UserService } from "@/src/application/services/UserService";
import { UserRepository } from "@/src/infrastructure/repositories/UserRepository";
import { ForbiddenError } from "@/src/domain/errors/AppError";
import {
  mockAdminUser,
  mockManagerUser,
  mockMemberUser,
} from "@/tests/unit/mocks/mockData";

vi.mock("@/src/application/services/UserService");
vi.mock("@/src/infrastructure/repositories/UserRepository");

describe("API Route: PATCH /api/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يجب أن يقبل تعديل بيانات المستخدم بنجاح مع كود 200 للمستخدم المصرح له", async () => {
    const updatedUserMock = {
      ...mockMemberUser,
      name: "اسم جديد محدث",
    };

    // محاكاة وجود المستخدم في المستودع
    vi.mocked(UserRepository.prototype.findById).mockResolvedValueOnce(
      mockMemberUser,
    );

    // محاكاة نجاح التعديل في الخدمة
    vi.mocked(UserService.prototype.updateUser).mockResolvedValueOnce(
      updatedUserMock,
    );

    const request = new Request(
      `http://localhost:3000/api/users/${mockMemberUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": mockMemberUser.id,
          "x-user-role": mockMemberUser.role,
        },
        body: JSON.stringify({ name: "اسم جديد محدث" }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: mockMemberUser.id }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(JSON.parse(JSON.stringify(updatedUserMock)));
  });

  it("يجب أن يعيد خطأ 404 عندما يكون المستخدم المستهدف غير موجود", async () => {
    vi.mocked(UserRepository.prototype.findById).mockResolvedValueOnce(null);

    const request = new Request(
      "http://localhost:3000/api/users/non-existent-user",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": mockAdminUser.id,
          "x-user-role": mockAdminUser.role,
        },
        body: JSON.stringify({ name: "تحديث" }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "non-existent-user" }),
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("المستخدم غير موجود");
  });

  it("يجب أن يعيد خطأ 403 عند محاولة عضو تعديل بيانات مستخدم آخر", async () => {
    vi.mocked(UserRepository.prototype.findById).mockResolvedValueOnce(
      mockManagerUser,
    );

    vi.mocked(UserService.prototype.updateUser).mockRejectedValueOnce(
      new ForbiddenError(
        "صلاحيات غير كافية: لا يمكنك تعديل بيانات مستخدمين آخرين",
      ),
    );

    const request = new Request(
      `http://localhost:3000/api/users/${mockManagerUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": mockMemberUser.id,
          "x-user-role": mockMemberUser.role,
        },
        body: JSON.stringify({ name: "اختبار تعديل محظور" }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: mockManagerUser.id }),
    });

    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe(
      "صلاحيات غير كافية: لا يمكنك تعديل بيانات مستخدمين آخرين",
    );
  });

  it("يجب أن يعيد خطأ 500 عند حدوث استثناء غير متوقع في الخادم", async () => {
    vi.mocked(UserRepository.prototype.findById).mockResolvedValueOnce(
      mockMemberUser,
    );

    vi.mocked(UserService.prototype.updateUser).mockRejectedValueOnce(
      new Error("Database write error"),
    );

    const request = new Request(
      `http://localhost:3000/api/users/${mockMemberUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "تحديث" }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: mockMemberUser.id }),
    });

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
  });
});
