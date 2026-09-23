import { Task, TaskStatus, Priority } from "@prisma/client";
import { ProjectAnalyticsResult } from "../types/ProjectAnalyticsResult";

export function calculateProjectAnalytics(
  tasks: Task[],
): ProjectAnalyticsResult {
  const totalTasks = tasks.length;
  let completedTasks = 0;
  let overdueTasks = 0;
  let criticalTasks = 0;

  const tasksByStatus: Record<TaskStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
    CANCELLED: 0,
  };

  const tasksByPriority: Record<Priority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  const now = new Date();

  // المرور على المهام مرة واحدة فقط بزمن تعقيد O(n)
  for (const task of tasks) {
    tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
    tasksByPriority[task.priority] = (tasksByPriority[task.priority] || 0) + 1;

    if (task.status === TaskStatus.DONE) {
      completedTasks++;
    }

    if (task.priority === Priority.CRITICAL) {
      criticalTasks++;
    }

    if (
      task.dueDate &&
      task.dueDate < now &&
      task.status !== TaskStatus.DONE &&
      task.status !== TaskStatus.CANCELLED
    ) {
      overdueTasks++;
    }
  }

  const pendingTasks = totalTasks - completedTasks - tasksByStatus.CANCELLED;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const overdueRate =
    totalTasks === 0 ? 0 : Math.round((overdueTasks / totalTasks) * 100);

  // خوارزمية تحديد صحة المشروع (Project Health Score)
  let healthScore: "HEALTHY" | "AT_RISK" | "CRITICAL" = "HEALTHY";
  if (
    (completionRate < 20 && overdueRate > 30) ||
    (totalTasks > 0 && criticalTasks / totalTasks > 0.2)
  ) {
    healthScore = "CRITICAL";
  } else if (overdueRate > 15 || (completionRate < 50 && criticalTasks > 0)) {
    healthScore = "AT_RISK";
  }
  const remainingTasks = (totalTasks - completedTasks);
  return {
    totalTasks,
    remainingTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    criticalTasks,
    completionRate,
    overdueRate,
    tasksByStatus,
    tasksByPriority,
    healthScore,
  };
}
