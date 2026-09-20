import { NextResponse } from "next/server";
import { auth } from "@/src/auth";

// 1. تحديد المسارات العامة لمصادقة المستخدم
const AUTH_ROUTES = ["/login", "/register"];
const DEFAULT_LOGIN_REDIRECT = "/";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userId = req.auth?.user?.id || "";
  const userRole = req.auth?.user?.role || "MEMBER";
  const { nextUrl } = req;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname);

  // --- 1. حماية وتمرير طلبات الـ API ---
  if (isApiRoute) {
    if (isApiAuthRoute) return NextResponse.next();

    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 },
      );
    }

    // إضافة بيانات المستخدم إلى الهيدرز للاستخدام في الـ API / Service Layer
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("user-id", userId);
    requestHeaders.set("user-role", userRole);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // --- 2. التحكم في حظر وسماح الوصول للصفحات (Pages) ---

  // أ. مستخدم غير مسجل يحاول الوصول لأي صفحة غير (login/register) -> تحويل لصفحة الدخول
  if (!isLoggedIn && !isAuthRoute) {
    const fullPath = nextUrl.pathname + nextUrl.search; // الحفاظ على الرابط مع المتغيرات Query Params
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // ب. مستخدم مسجل دخوله يحاول زيارة صفحات (login/register) -> تحويل للصفحة الرئيسية
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
