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

export class ActivityLogService {
  constructor(private activityLogRepository: IActivityLogRepository) {}

  async logActivity(data: {
    userId: string;
    action: string;
    projectId?: string;
    taskId?: string;
    metadata?: ActivityMetadata;
  }): Promise<ActivityLog> {
    return this.activityLogRepository.create(data);
  }

  async getLogs(
    executorRole: Role,
    filters?: IActivityLogFilterOptions,
  ): Promise<ActivityLogWithUser[]> {
    if (executorRole === Role.MEMBER) {
      throw new Error("صلاحيات غير كافية: لا يحق للأعضاء استعراض سجل الأنشطة");
    }

    return this.activityLogRepository.findAll(filters);
  }

  async getLogById(
    executorRole: Role,
    id: string,
  ): Promise<ActivityLogWithUserProjectTask | null> {
    if (executorRole === Role.MEMBER) {
      throw new Error("صلاحيات غير كافية: لا يحق للأعضاء استعراض تفاصيل السجل");
    }

    const log = await this.activityLogRepository.findById(id);
    if (!log) throw new Error("سجل النشاط غير موجود");

    return log;
  }
}
