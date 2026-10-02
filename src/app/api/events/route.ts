import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth"; // عدّل المسار لخيار التهيئة الخاط بـ NextAuth
import { ActivityLogService } from "@/src/application/services/ActivityLogService";
import { ActivityLogRepository } from "@/src/infrastructure/repositories/ActivityLogRepository";
import { Role } from "@prisma/client";
import { AppError } from "@/src/domain/errors/AppError";

const activityLogService = new ActivityLogService(new ActivityLogRepository());

export async function GET(req: NextRequest) {
  try {
    // 1. التحقق من أمان الجلسة والصلاحيات
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 },
      );
    }

    const userRole = session.user.role || Role.MEMBER;

    // 2. استخراج معاملات الترقيم والبحث من الرابط
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      Math.min(50, parseInt(searchParams.get("limit") || "10", 10)),
    );
    const search = searchParams.get("search") || undefined;
    const action = searchParams.get("action") || undefined;

    // 3. جلب البيانات من الخدمة
    const logs = await activityLogService.getLogs(userRole, {
      page,
      limit,
      search,
      action,
    });

    // 4. تحديد ما إذا كان هناك المزيد من البيانات للتمرير اللانهائي (Infinite Scroll)
    const hasMore = logs.length === limit;

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/projects Error:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("خطأ في GET /api/events:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ داخلي أثناء جلب قائمة الأحداث" },
      { status: 500 },
    );
  }
}
