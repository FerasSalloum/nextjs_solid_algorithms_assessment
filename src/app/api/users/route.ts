import { NextResponse } from "next/server";
import { UserService } from "@/src/application/services/UserService";
import { UserRepository } from "@/src/infrastructure/repositories/UserRepository";
import { BcryptHashService } from "@/src/infrastructure/security/BcryptHashService";
import { AppError, UnauthorizedError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role")?.toUpperCase();

    // التحقق من صحة معامل الدور (role) وتطابقه مع enum Role
    if (!roleParam || !Object.values(Role).includes(roleParam as Role)) {
      throw new UnauthorizedError("الدور المحدد غير صالح أو غير موجود");
    }

    const role = roleParam as Role;
    const userRepository = new UserRepository();
    const hashService = new BcryptHashService();
    const userService = new UserService(userRepository, hashService);

    const users = await userService.getUsersByRole(role);

    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/users Error:", error);

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
