import { describe, it, expect } from "vitest";
import { calculateProjectAnalytics } from "@/src/algorithms/projectAnalyticsCalculator";
import { Task, TaskStatus, Priority } from "@prisma/client";
import { mockTask } from "../mocks/mockData";

describe("Algorithm: calculateProjectAnalytics", () => {
  const mockBaseTask: Task = mockTask;
  it("يجب أن يحسب التحليلات بشكل صحيح لمشروع فارغ", () => {
    const result = calculateProjectAnalytics([]);

    expect(result.totalTasks).toBe(0);
    expect(result.completedTasks).toBe(0);
    expect(result.completionRate).toBe(0);
    expect(result.healthScore).toBe("HEALTHY");
  });

  it("يجب أن يصنف المشروع كـ HEALTHY عندما تكون نسبة الإنجاز عالية ولا توجد مشاكل", () => {
    const tasks: Task[] = [
      {
        ...mockBaseTask,
        id: "1",
        status: TaskStatus.DONE,
        priority: Priority.LOW,
        dueDate: null,
      },
      {
        ...mockBaseTask,
        id: "2",
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
        dueDate: null,
      },
      {
        ...mockBaseTask,
        id: "3",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.LOW,
        dueDate: new Date(Date.now() + 86400000),
      }, // في المستقبل
    ];

    const result = calculateProjectAnalytics(tasks);

    expect(result.totalTasks).toBe(3);
    expect(result.completedTasks).toBe(2);
    expect(result.completionRate).toBe(67); // 2/3 * 100
    expect(result.healthScore).toBe("HEALTHY");
  });

  it("يجب أن يصنف المشروع كـ CRITICAL عند ارتفاع المهام المتأخرة والحرجة", () => {
    const pastDate = new Date(Date.now() - 86400000); // في الماضي (متأخرة)

    const tasks: Task[] = [
      {
        ...mockBaseTask,
        id: "1",
        status: TaskStatus.TODO,
        priority: Priority.CRITICAL,
        dueDate: pastDate,
      },
      {
        ...mockBaseTask,
        id: "2",
        status: TaskStatus.TODO,
        priority: Priority.CRITICAL,
        dueDate: pastDate,
      },
      {
        ...mockBaseTask,
        id: "3",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        dueDate: pastDate,
      },
    ];

    const result = calculateProjectAnalytics(tasks);

    expect(result.criticalTasks).toBe(2);
    expect(result.overdueTasks).toBe(3);
    expect(result.healthScore).toBe("CRITICAL");
  });
});
