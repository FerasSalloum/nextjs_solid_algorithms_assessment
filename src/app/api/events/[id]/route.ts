import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { ActivityLogService } from "@/src/application/services/ActivityLogService";
import { ActivityLogRepository } from "@/src/infrastructure/repositories/ActivityLogRepository";
import { Role } from "@prisma/client";
import { AppError } from "@/src/domain/errors/AppError";

const activityLogService = new ActivityLogService(new ActivityLogRepository());

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 },
      );
    }

    const userRole = session.user.role || Role.MEMBER;
    // 2. جلب تفاصيل الحدث المحددة
    const eventDetail = await activityLogService.getLogById(userRole, id);

    return NextResponse.json({
      success: true,
      data: eventDetail,
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
