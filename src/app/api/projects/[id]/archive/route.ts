import { NextResponse } from "next/server";
import { ProjectService } from "@/src/application/services/ProjectService";
import { ProjectRepository } from "@/src/infrastructure/repositories/ProjectRepository";
import { AppError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    id: string; // projectId
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    const executorId = request.headers.get("user-id") || "";

    const executorRole =
      (request.headers.get("user-role") as Role) || Role.MEMBER;

    const projectRepository = new ProjectRepository();
    const projectService = new ProjectService(projectRepository);

    // استدعاء دالة الأرشفة بالترتيب المتوافق مع الخدمة: (executorId, executorRole, projectId)
    const archivedProject = await projectService.archiveProject(
      executorId,
      executorRole,
      projectId,
    );

    return NextResponse.json(
      {
        success: true,
        data: archivedProject,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/projects/[id]/archive Error:", error);

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
