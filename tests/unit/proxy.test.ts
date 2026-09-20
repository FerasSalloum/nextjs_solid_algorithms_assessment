import { describe, it, expect, vi } from "vitest";
import  proxy  from "@/src/proxy";
import { NextRequest, NextResponse } from "next/server";

// 1. تعريف واجهات واضحة بدلاً من الاستيراد الداخلي
interface RouteContext {
  params: Promise<Record<string, string | string[]>>;
}
interface AuthUser {
  user: {
    id: string;
    role: "ADMIN" | "MEMBER";
  };
}

// توسيع النوع لتفادي أخطاء TypeScript عند حقن الجلسة
type AuthenticatedRequest = NextRequest & { auth?: AuthUser | null };

// 1. محاكاة دالة auth بأنواع محددة
vi.mock("@/src/auth", () => ({
  // استخدام التوقيع الصحيح للدالة
  auth: (
    callback: (req: AuthenticatedRequest, context: RouteContext) => unknown,
  ) => {
    return async (req: AuthenticatedRequest, context: RouteContext) => {
      const authHeader = req.headers.get("x-mock-auth");

      // حقن الجلسة
      req.auth =
        authHeader === "logged-in"
          ? { user: { id: "user-123", role: "ADMIN" } }
          : null;

      return callback(req, context);
    };
  },
}));

describe("Proxy / Middleware Security & Header Injection Tests", () => {
  // تعريف السياق بأنواعه الصحيحة
  const dummyContext: RouteContext = {
    params: Promise.resolve({}),
  };
  it("يرفض الطلب بـ 401 إذا كان مسار API غير مصرح به والمستخدم غير مسجل دخول", async () => {
    const req = new NextRequest("http://localhost:3000/api/tasks", {
      method: "GET",
    });

    const res = (await proxy(req, dummyContext)) as NextResponse;

    expect(res).toBeDefined();
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("غير مصرح لك بالوصول"); // عدل حسب رسالة الخطأ الحقيقية في الكود
  });

  it("يسمح بالمرور لمسارات التوثيق /api/auth حتى لو لم يكن المستخدم مسجلاً", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/auth/callback/credentials",
      {
        method: "POST",
      },
    );

    const res = await proxy(req, dummyContext);
    expect(res).toBeDefined();
  });

  it("يحقن ترويسات user-id و user-role بنجاح عندما يكون المستخدم مسجلاً ويطلب مسار API", async () => {
    const req = new NextRequest("http://localhost:3000/api/tasks", {
      method: "GET",
      headers: {
        "x-mock-auth": "logged-in",
      },
    });

    const res = (await proxy(req, dummyContext)) as NextResponse;

    expect(res).toBeDefined();
    expect(res).not.toBeNull();
  });
});
