import {
  IActivityLogRepository,
  IActivityLogFilterOptions,
} from "@/src/domain/interfaces/IActivityLogRepository";
import {
  ActivityLogWithUser,
  ActivityLogWithUserProjectTask,
} from "@/src/types/ActivityLog";
import { ActivityMetadata } from "@/src/types/ActivityMetadata";
import { ActivityLog, Role } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/src/domain/errors/AppError";
import { eventBus } from "@/src/infrastructure/events/EventBus";
import { ACTIVITY_EVENTS } from "@/src/domain/events/ActiviteEvents";

export class ActivityLogService {
  constructor(private activityLogRepository: IActivityLogRepository) {}

  async logActivity(data: {
    userId: string;
    action: string;
    projectId?: string;
    taskId?: string;
    metadata?: ActivityMetadata;
  }): Promise<ActivityLog> {
    eventBus.on(ACTIVITY_EVENTS.TASK_CREATED, (payload) => {
  console.log("📥 تم استقبال الحدث بنجاح:", payload);
});
    return await this.activityLogRepository.create(data);
  }

  async getLogs(
    executorRole: Role,
    filters?: IActivityLogFilterOptions,
  ): Promise<ActivityLogWithUser[]> {
    if (executorRole === Role.MEMBER) {
      throw new ForbiddenError(
        "صلاحيات غير كافية: لا يحق للأعضاء استعراض سجل الأنشطة",
      );
    }

    return await this.activityLogRepository.findAll(filters);
  }

  async getLogById(
    executorRole: Role,
    id: string,
  ): Promise<ActivityLogWithUserProjectTask> {
    if (executorRole === Role.MEMBER) {
      throw new ForbiddenError(
        "صلاحيات غير كافية: لا يحق للأعضاء استعراض تفاصيل السجل",
      );
    }

    const log = await this.activityLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError("سجل النشاط غير موجود");
    }

    return log;
  }
}   
