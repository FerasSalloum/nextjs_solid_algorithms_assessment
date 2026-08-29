import { prisma } from "@/src/lib/prisma";
import {
  IActivityLogRepository,
  IActivityLogFilterOptions,
} from "@/src/domain/interfaces/IActivityLogRepository";
import { ActivityMetadata } from "@/src/types/ActivityMetadata";
import { ActivityLog, Prisma } from "@prisma/client";
import { ActivityLogWithUser, ActivityLogWithUserProjectTask } from "@/src/types/ActivityLog";

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
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      } 
    });
  }

  async findAll(filters?: IActivityLogFilterOptions): Promise<ActivityLogWithUser[]> {
    return prisma.activityLog.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.projectId && { projectId: filters.projectId }),
        ...(filters?.taskId && { taskId: filters.taskId }),
        ...(filters?.action && { action: filters.action }),
      },
      take: filters?.limit, // تحديد عدد النتائج المسترجعة
      orderBy: { createdAt: "desc" }, // عرض الأحداث الأحدث أولاً
      include: {
        user: { select: { id: true, name: true, email: true } } // جلب معلومات مبسطة عن منفذ العملية
      }
    });
  }

  async findById(id: string): Promise<ActivityLogWithUserProjectTask | null> {
    return prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } }
      }
    });
  }
}