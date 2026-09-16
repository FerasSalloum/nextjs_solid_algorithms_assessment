import { NextRequest, NextResponse } from "next/server";
import { createTaskSchema } from "@/src/validators/task.schema";
import { TaskService } from "@/src/application/services/TaskService";
import { TaskRepository } from "@/src/infrastructure/repositories/TaskRepository";
import { AppError } from "@/src/domain/errors/AppError";
import { TaskStatus, Priority, Role } from "@prisma/client";


const taskService = new TaskService(new TaskRepository());

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: جلب جميع مهام مشروع معين مع دعم الفلترة
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);

    // استخراج الفلاتر
    const filters = {
      projectId,
      status: (searchParams.get("status") as TaskStatus) || undefined,
      priority: (searchParams.get("priority") as Priority) || undefined,
      assigneeId: searchParams.get("assigneeId") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const tasks = await taskService.getTasks(filters);

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/projects/[id]/tasks Error:", error);

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

// POST: إنشاء مهمة جديدة داخل مشروع معين
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    // 1. قراءة الـ JSON بأمان
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "جسم الطلب فارغ أو غير صالحة صيغة JSON" },
        { status: 400 }
      );
    }

    // 2. تزويد body بـ projectId المأخوذ من URL Params لتمرير تحقق Zod
    const payload = {
      ...body,
      projectId,
    };

    // 3. التحقق من صحة المدخلات بـ Zod
    const validation = createTaskSchema.safeParse(payload);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "بيانات الإدخال غير صالحة",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. استخراج بيانات المنفذ من Headers
    const executorId = request.headers.get("user-id") || "";
    const executorRole = (request.headers.get("user-role") as Role) || Role.MEMBER;

    // 5. تجهيز البيانات وتنفيذ الخدمة
    const taskData = {
      title: validation.data.title,
      description: validation.data.description,
      projectId: validation.data.projectId,
      assigneeId: validation.data.assigneeId ?? undefined, // تحويل null إلى undefined إن وجد
      ownerId: executorId,
      status: validation.data.status as TaskStatus | undefined,
      priority: validation.data.priority as Priority | undefined,
      dueDate: validation.data.dueDate,
      estimatedHours: validation.data.estimatedHours,
    };

    const newTask = await taskService.createTask(executorRole, taskData);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/projects/[id]/tasks Error:", error);

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