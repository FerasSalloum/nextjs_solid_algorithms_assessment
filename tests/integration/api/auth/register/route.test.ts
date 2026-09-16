import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/src/app/api/auth/register/route";
import { NextRequest } from "next/server";
import { UserService } from "@/src/application/services/UserService";
import { ConflictError } from "@/src/domain/errors/AppError";
import { mockAdminUser } from "@/tests/unit/mocks/mockData";

vi.mock("@/src/application/services/UserService");

describe("POST /api/auth/register Route Handler Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("status 201 ويُنشئ الحساب بنجاح دون إرجاع توكن أو كوكيز", async () => {
    const createdUser = {
      ...mockAdminUser,
      id: "new-user-id",
      name: "New User",
      email: "newuser@example.com",
    };

    vi.mocked(UserService.prototype.register).mockResolvedValue(createdUser);

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New User",
        email: "newuser@example.com",
        password: "Password123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe("تم إنشاء الحساب بنجاح");
    expect(data.user).not.toHaveProperty("passwordHash");
    expect(data.user.email).toBe("newuser@example.com");
    expect(data).not.toHaveProperty("token"); // لم يعد الـ API يصدر توكن
  });

  it("يرجع status 400 عند إرسال Request Body فارغ أو JSON غير صالح", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid-json-body",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("جسم الطلب فارغ أو غير صالحة صيغة JSON");
  });

  it("يرجع status 400 عند فشل التحقق من صحة المدخلات عبر registerSchema (Zod Validation)", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "invalid-email-format",
        password: "123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("بيانات الإدخال غير صالحة");
    expect(data.details).toHaveProperty("name");
    expect(data.details).toHaveProperty("email");
    expect(data.details).toHaveProperty("password");
  });

  it("يرجع status 409 عند رمي ConflictError بسبب تكرار البريد الإلكتروني", async () => {
    vi.mocked(UserService.prototype.register).mockRejectedValue(
      new ConflictError("البريد الإلكتروني مستخدم بالفعل"),
    );

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Existing User",
        email: "existing@example.com",
        password: "Password123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("البريد الإلكتروني مستخدم بالفعل");
  });

  it("يرجع status 500 عند حدوث خطأ غير متوقع في الخادم", async () => {
    vi.mocked(UserService.prototype.register).mockRejectedValue(
      new Error("Unexpected Database Connection Error"),
    );

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
  });
});
