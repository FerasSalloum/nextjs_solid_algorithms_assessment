import { NextRequest, NextResponse } from "next/server";
import { updateTaskSchema } from "@/src/validators/task.schema";
import { TaskService } from "@/src/application/services/TaskService";
import { TaskRepository } from "@/src/infrastructure/repositories/TaskRepository";
import { AppError } from "@/src/domain/errors/AppError";
import { Role, TaskStatus, Priority } from "@prisma/client";

const taskService = new TaskService(new TaskRepository());

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const task = await taskService.getTaskById(id);

    return NextResponse.json(task, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/tasks/[id] Error:", error);

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

// PATCH: تحديث بيانات مهمة محددة
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: taskId } = await params;

    // 1. قراءة الـ JSON بأمان
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "جسم الطلب فارغ أو غير صالحة صيغة JSON" },
        { status: 400 },
      );
    }

    // 2. التحقق من صحة المدخلات بـ Zod
    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "بيانات الإدخال غير صالحة",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // 3. استخراج بيانات المنفذ من الهيدرز
    const executorId = request.headers.get("user-id") || "";
    const executorRole =
      (request.headers.get("user-role") as Role) || Role.MEMBER;

    // 4. تجهيز البيانات للتحديث مع تحويل الأنواع لتتوافق مع Prisma
    const updateData = {
      ...validation.data,
      assigneeId: validation.data.assigneeId ?? undefined, // تحويل null إلى undefined إن وجد
      status: validation.data.status as TaskStatus | undefined,
      priority: validation.data.priority as Priority | undefined,
    };

    // 5. استدعاء الخدمة بالتريب المعتمد: (executorId, executorRole, taskId, updateData)
    const updatedTask = await taskService.updateTask(
      executorId,
      executorRole,
      taskId,
      updateData,
    );

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: unknown) {
    console.error("PATCH /api/tasks/[id] Error:", error);

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

// DELETE: حذف مهمة محددة نهائياً
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: taskId } = await params;

    // استخراج بيانات المنفذ من الهيدرز
    const executorId = request.headers.get("user-id") || "";
    const executorRole =
      (request.headers.get("user-role") as Role) || Role.MEMBER;

    // استدعاء الخدمة بالتريب المعتمد: (executorId, executorRole, taskId)
    await taskService.deleteTask(executorId, executorRole, taskId);

    return NextResponse.json(
      { message: "تم حذف المهمة بنجاح" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("DELETE /api/tasks/[id] Error:", error);

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
