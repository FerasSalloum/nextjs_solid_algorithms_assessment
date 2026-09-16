import { NextResponse } from "next/server";
import { UserService } from "@/src/application/services/UserService";
import { UserRepository } from "@/src/infrastructure/repositories/UserRepository";
import { BcryptHashService } from "@/src/infrastructure/security/BcryptHashService";
import { AppError, NotFoundError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    id: string; // targetUserId
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();

    const url = new URL(request.url);
    const executorId =
      request.headers.get("x-user-id") ||
      body.executorId ||
      url.searchParams.get("executorId") ||
      "";

    const executorRole =
      (request.headers.get("x-user-role") as Role) ||
      (body.executorRole as Role) ||
      (url.searchParams.get("executorRole") as Role) ||
      Role.MEMBER;

    const userRepository = new UserRepository();
    const hashService = new BcryptHashService();
    const userService = new UserService(userRepository, hashService);

    // 1. التحقق من وجود المستخدم المستهدف وتحديد دوره الحالي
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError("المستخدم غير موجود");
    }

    // 2. تصفية البيانات المدخلة وحذف هيدرز التحقق من الـ body إن وجدت
    const { executorId: _, executorRole: __, ...updateData } = body;

    // 3. استدعاء الخدمة لتحديث البيانات مع فحص الصلاحيات
    const updatedUser = await userService.updateUser(
      executorId,
      executorRole,
      targetUserId,
      targetUser.role,
      updateData,
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/users/[id] Error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ في الخادم أثناء معالجة الطلب" },
      { status: 500 },
    );
  }
}
