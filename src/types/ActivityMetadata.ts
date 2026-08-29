import { Prisma } from "@prisma/client";

export interface ActivityMetadata {
  previousStatus?: string;
  newStatus?: string;
  previousPriority?: string;
  newPriority?: string;
  previousAssigneeId?: string | null;
  newAssigneeId?: string | null;
  changedFields?: string[];
  entityTitle?: string;
  reason?: string;
}
export type PrismaActivityMetadata = ActivityMetadata & Prisma.InputJsonObject;
