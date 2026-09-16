import { NextResponse } from "next/server";
import { ProjectAnalyticsService } from "@/src/application/services/ProjectAnalyticsService";
import { ProjectRepository } from "@/src/infrastructure/repositories/ProjectRepository";
import { TaskRepository } from "@/src/infrastructure/repositories/TaskRepository";
import { AppError } from "@/src/domain/errors/AppError"; // استيراد الكلاس الأساسي للأخطاء
import { Role } from "@prisma/client";

// نوع الـ params في Next.js 15 الحديث (Promise)
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // 1. فك المعرفات من الرابط الديناميكي
    const { id: projectId } = await params;

    // 2. استخلاص هُوية المستخدم والصلاحيات من الهيدرز أو الرابط
    const url = new URL(request.url);
    const executorId =
      request.headers.get("x-user-id") ||
      url.searchParams.get("executorId") ||
      "";
    const executorRole =
      (request.headers.get("x-user-role") as Role) ||
      (url.searchParams.get("executorRole") as Role) ||
      Role.MEMBER;

    // 3. حقن المستودعات وإنشاء خدمة التحليلات (Dependency Injection)
    const projectRepository = new ProjectRepository();
    const taskRepository = new TaskRepository();
    const analyticsService = new ProjectAnalyticsService(
      projectRepository,
      taskRepository,
    );

    // 4. استدعاء الدالة لجلب التحليلات وصحة المشروع
    const analytics = await analyticsService.getProjectAnalytics(
      executorId,
      executorRole,
      projectId,
    );

    // 5. إرجاع النتيجة بنجاح
    return NextResponse.json(
      {
        success: true,
        data: analytics,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    // تسجيل الخطأ للتصحيح (Debugging)
    console.error("GET /api/projects/[id]/analytics Error:", error);

    // التعامل الموحد مع جميع أخطاء النظام المخصصة التي ترث من AppError
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    // الأخطاء العامة غير المتوقعة (Server Crash / Database Connection Error الخ)
    return NextResponse.json(
      { error: "حدث خطأ في الخادم أثناء معالجة الطلب" },
      { status: 500 },
    );
  }
}
