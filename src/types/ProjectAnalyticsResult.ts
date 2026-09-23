import { TaskStatus, Priority } from "@prisma/client";

export interface ProjectAnalyticsResult {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  criticalTasks: number;
  completionRate: number;
  overdueRate: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<Priority, number>;
  healthScore: "HEALTHY" | "AT_RISK" | "CRITICAL";
}
