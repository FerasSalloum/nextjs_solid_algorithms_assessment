import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema } from "@/src/validators/project.schema";
import { ProjectService } from "@/src/application/services/ProjectService";
import { ProjectRepository } from "@/src/infrastructure/repositories/ProjectRepository";
import { AppError } from "@/src/domain/errors/AppError";
import { ProjectStatus, Role } from "@prisma/client";

const projectService = new ProjectService(new ProjectRepository());

// GET: جلب قائمة المشاريع مع دعم الفلاتر
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      status: (searchParams.get("status") as ProjectStatus) || undefined,
      ownerId: searchParams.get("ownerId") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const projects = await projectService.getProjectWithOwnerTask(filters);

    return NextResponse.json(projects, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/projects Error:", error);

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

// POST: إنشاء مشروع جديد
export async function POST(request: NextRequest) {
  try {
    // 1. قراءة الـ JSON بأمان
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "جسم الطلب فارغ أو غير صالحة صيغة JSON" },
        { status: 400 },
      );
    }

    // 2. التحقق من صحة المدخلات باستخدام createProjectSchema
    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "بيانات الإدخال غير صالحة",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // 3. استخراج المالك ودور المنفذ من الـ Headers (يتم ضبطهما بواسطة الـ Middleware بعد التحقق من الـ JWT)
    const executorId = request.headers.get("user-id") || "";
    const executorRole =
      (request.headers.get("user-role") as Role) || Role.MEMBER;

    // 4. تنفيذ إنشاء المشروع عبر الخدمة
    const project = await projectService.createProject(executorRole, {
      ...validation.data,
      ownerId: executorId,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/projects Error:", error);

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
