import { ActivityMetadata } from "@/src/types/ActivityMetadata";
import { ActivityLog } from "@prisma/client";

export interface IActivityLogFilterOptions {
  userId?: string;
  projectId?: string;
  taskId?: string;
  action?: string;
  limit?: number;
}

export interface IActivityLogRepository {
  create(data: {
    userId: string;
    action: string;
    projectId?: string;
    taskId?: string;
    metadata?: ActivityMetadata
  }): Promise<ActivityLog>;

  findAll(filters?: IActivityLogFilterOptions): Promise<ActivityLog[]>;
  findById(id: string): Promise<ActivityLog | null>;
}
