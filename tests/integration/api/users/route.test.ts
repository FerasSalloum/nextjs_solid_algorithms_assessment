import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/src/app/api/users/route"
import { UserService } from "@/src/application/services/UserService";
import { mockMemberUser } from "@/tests/unit/mocks/mockData";
import { Role } from "@prisma/client";

vi.mock("@/src/application/services/UserService");

describe("API Route: GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يجب أن يعيد قائمة المستخدمين حسب الدور بنجاح مع كود 200", async () => {
    const mockUsers = [mockMemberUser];

    vi.mocked(UserService.prototype.getUsersByRole).mockResolvedValueOnce(
      mockUsers,
    );

    const request = new Request("http://localhost:3000/api/users?role=MEMBER", {
      method: "GET",
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(JSON.parse(JSON.stringify(mockUsers)));
    expect(UserService.prototype.getUsersByRole).toHaveBeenCalledWith(
      Role.MEMBER,
    );
  });

  it("يجب أن يعيد خطأ 401 عندما يكون معامل الدور (role) غير ممرر أو غير صالح", async () => {
    const request = new Request(
      "http://localhost:3000/api/users?role=INVALID_ROLE",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("الدور المحدد غير صالح أو غير موجود");
  });

  it("يجب أن يعيد خطأ 500 عند حدوث استثناء غير متوقع في الخادم", async () => {
    vi.mocked(UserService.prototype.getUsersByRole).mockRejectedValueOnce(
      new Error("Database connection error"),
    );

    const request = new Request("http://localhost:3000/api/users?role=ADMIN", {
      method: "GET",
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
  });
});
