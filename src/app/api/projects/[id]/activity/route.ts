import { NextResponse } from "next/server";
import { ActivityLogService } from "@/src/application/services/ActivityLogService";
import { ActivityLogRepository } from "@/src/infrastructure/repositories/ActivityLogRepository";
import { AppError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // 1. فك معرف المشروع من المسار الديناميكي (Next.js 15)
    const { id: projectId } = await params;

    // 2. استخلاص الصلاحية من Header محمي لضمان عدم التلاعب بها، والخيارات الإضافية للفلترة
    const url = new URL(request.url);
    const executorRole =
      (request.headers.get("user-role") as Role) || Role.MEMBER;
    const userId =
      (request.headers.get("user-Id") as string) || undefined;

    const action = url.searchParams.get("action") || undefined;

    // 3. حقن المستودع وإنشاء الخدمة
    const activityLogRepository = new ActivityLogRepository();
    const activityLogService = new ActivityLogService(activityLogRepository);

    // 4. استدعام الخدمة لجلب السجلات وفق الفلترة
    const logs = await activityLogService.getLogs(executorRole, {
      projectId,
      userId,
      action,
    });

    // 5. إرجاع النتيجة بنجاح
    return NextResponse.json(
      {
        success: true,
        data: logs,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("GET /api/projects/[id]/activity Error:", error);

    // التعامل الموحد مع جميع الأخطاء المخصصة (ForbiddenError, NotFoundError, إلخ)
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ في الخادم أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}