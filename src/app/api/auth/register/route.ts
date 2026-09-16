import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/src/validators/auth.schema";
import { UserService } from "@/src/application/services/UserService";
import { UserRepository } from "@/src/infrastructure/repositories/UserRepository";
import { BcryptHashService } from "@/src/infrastructure/security/BcryptHashService";
import { AppError } from "@/src/domain/errors/AppError";


const userService = new UserService(
  new UserRepository(),
  new BcryptHashService(),
);
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "جسم الطلب فارغ أو غير صالحة صيغة JSON" },
        { status: 400 },
      );
    }

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "بيانات الإدخال غير صالحة",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, password } = validation.data;

    const result = await userService.register({
      name,
      email,
      passwordRaw: password,
    });

    const user = result;
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "تم إنشاء الحساب بنجاح",
        user: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Register Route Error:", error);

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
