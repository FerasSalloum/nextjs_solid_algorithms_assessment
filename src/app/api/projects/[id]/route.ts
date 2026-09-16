import { NextRequest, NextResponse } from "next/server";
import { updateProjectSchema } from "@/src/validators/project.schema";
import { ProjectService } from "@/src/application/services/ProjectService";
import { ProjectRepository } from "@/src/infrastructure/repositories/ProjectRepository";
import { AppError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";


const projectService = new ProjectService(new ProjectRepository());

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: جلب تفاصيل مشروع محدد بواسطة ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const project = await projectService.getProjectById(id);

    return NextResponse.json(project, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/projects/[id] Error:", error);

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

// PATCH: تحديث بيانات مشروع محدد
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 1. قراءة الـ JSON بأمان
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "جسم الطلب فارغ أو غير صالحة صيغة JSON" },
        { status: 400 },
      );
    }

    // 2. التحقق من صحة المدخلات باستخدام updateProjectSchema
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "بيانات الإدخال غير صالحة",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // 3. استخراج بيانات المستخدم والمنفذ من الـ Headers
    const executorId = request.headers.get("user-id") || "";
    const executorRole =
      (request.headers.get("user-role") as Role) || Role.MEMBER;

    // 4. تنفيذ عملية التحديث عبر الخدمة
    const updatedProject = await projectService.updateProject(
      executorId,
      executorRole,
      id,
      validation.data,
    );

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error: unknown) {
    console.error("PATCH /api/projects/[id] Error:", error);

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

// DELETE: حذف مشروع محدد
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // استخراج بيانات المنفذ
    const executorRole =
      (request.headers.get("user-role") as Role) || Role.MEMBER;

    // تنفيذ الحذف عبر الخدمة
    await projectService.deleteProject(executorRole, id);

    return NextResponse.json(
      { message: "تم حذف المشروع بنجاح" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("DELETE /api/projects/[id] Error:", error);

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
