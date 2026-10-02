import { prisma } from "@/src/infrastructure/database/prisma";
import {
  IActivityLogRepository,
  IActivityLogFilterOptions,
} from "@/src/domain/interfaces/IActivityLogRepository";
import { ActivityMetadata } from "@/src/types/ActivityMetadata";
import { ActivityLog, Prisma } from "@prisma/client";
import {
  ActivityLogWithUser,
  ActivityLogWithUserProjectTask,
} from "@/src/types/ActivityLog";

export class ActivityLogRepository implements IActivityLogRepository {
  async create(data: {
    userId: string;
    action: string;
    projectId?: string;
    taskId?: string;
    metadata?: ActivityMetadata;
  }): Promise<ActivityLog> {
    return prisma.activityLog.create({
      data: {
        ...data,
        // تحويل النوع ليتوافق مع Prisma Json (إذا لزم الأمر)
        metadata: data.metadata
          ? (data.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  }

  async findAll(
    filters?: IActivityLogFilterOptions,
  ): Promise<ActivityLogWithUser[]> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    return await prisma.activityLog.findMany({
      where: {
        ...(filters?.action && { action: filters.action }),
        // أضف أي شروط بحث إضافية هنا
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
  }

  async findById(id: string): Promise<ActivityLogWithUserProjectTask | null> {
    return prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }
}
