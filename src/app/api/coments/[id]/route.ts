import { NextResponse } from "next/server";
import { TaskCommentService } from "@/src/application/services/TaskCommentService";
import { TaskCommentRepository } from "@/src/infrastructure/repositories/TaskCommentRepository";
import { AppError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    id: string; // commentId
  }>;
};

// تعديل تعليق محدد
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: commentId } = await params;
    const body = await request.json();

    const url = new URL(request.url);
    const executorId =
      request.headers.get("x-user-id") ||
      body.userId ||
      url.searchParams.get("executorId") ||
      "";

    const executorRole =
      (request.headers.get("x-user-role") as Role) ||
      (body.role as Role) ||
      (url.searchParams.get("executorRole") as Role) ||
      Role.MEMBER;

    const commentRepository = new TaskCommentRepository();
    const commentService = new TaskCommentService(commentRepository);

    // التمرير بالترتيب المحدد في الخدمة: (executorId, executorRole, commentId, content)
    const updatedComment = await commentService.updateComment(
      executorId,
      executorRole,
      commentId,
      body.content
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedComment,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("PATCH /api/comments/[id] Error:", error);

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

// حذف تعليق محدد
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: commentId } = await params;

    const url = new URL(request.url);
    const executorId =
      request.headers.get("x-user-id") ||
      url.searchParams.get("executorId") ||
      "";

    const executorRole =
      (request.headers.get("x-user-role") as Role) ||
      (url.searchParams.get("executorRole") as Role) ||
      Role.MEMBER;

    const commentRepository = new TaskCommentRepository();
    const commentService = new TaskCommentService(commentRepository);

    // التمرير بالترتيب المحدد في الخدمة: (executorId, executorRole, commentId)
    await commentService.deleteComment(executorId, executorRole, commentId);

    return NextResponse.json(
      {
        success: true,
        message: "تم حذف التعليق بنجاح",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE /api/comments/[id] Error:", error);

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