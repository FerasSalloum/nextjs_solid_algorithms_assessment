import { NextResponse } from "next/server";
import { TaskCommentService } from "@/src/application/services/TaskCommentService";
import { TaskCommentRepository } from "@/src/infrastructure/repositories/TaskCommentRepository";
import { AppError } from "@/src/domain/errors/AppError";

type RouteParams = {
  params: Promise<{
    id: string; // taskId
  }>;
};

// جلب جميع تعليقات المهمة
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: taskId } = await params;

    const commentRepository = new TaskCommentRepository();
    const commentService = new TaskCommentService(commentRepository);

    const comments = await commentService.getCommentsByTaskId(taskId);

    return NextResponse.json(
      {
        success: true,
        data: comments,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/tasks/[id]/comments Error:", error);

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

// إضافة تعليق جديد للمهمة
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();

    const url = new URL(request.url);
    const executorId =
      request.headers.get("x-user-id") ||
      body.userId ||
      url.searchParams.get("executorId") ||
      "";

    const commentRepository = new TaskCommentRepository();
    const commentService = new TaskCommentService(commentRepository);

    const newComment = await commentService.createComment({
      taskId,
      authorId: executorId,
      content: body.content,
    });

    return NextResponse.json(
      {
        success: true,
        data: newComment,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/tasks/[id]/comments Error:", error);

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
