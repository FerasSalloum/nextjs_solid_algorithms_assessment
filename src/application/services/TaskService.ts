import {
  ITaskRepository,
  ITaskFilterOptions,
} from "@/src/domain/interfaces/ITaskRepository";
import { TaskWithAssigneeProjectOwner } from "@/src/types/TaskRepository";
import { Task, TaskStatus, Priority, Role } from "@prisma/client";

export class TaskService {
  constructor(private taskRepository: ITaskRepository) {}

  async getTaskById(id: string): Promise<TaskWithAssigneeProjectOwner | null> {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new Error("المهمة غير موجودة");
    return task;
  }

  async getTasks(filters?: ITaskFilterOptions): Promise<Task[]> {
    return this.taskRepository.findAll(filters);
  }

  async createTask(
    executorRole: Role,
    data: {
      title: string;
      description?: string;
      projectId: string;
      assigneeId?: string;
      ownerId: string;
      status?: TaskStatus;
      priority?: Priority;
      dueDate?: Date;
      estimatedHours?: number;
    },
  ): Promise<Task> {
    if (executorRole === Role.ADMIN || executorRole === Role.MANAGER) {
      return this.taskRepository.create(data);
    }
    throw new Error("صلاحيات غير كافية: لا يمكنك إنشاء المهام");
  }

  async updateTask(
    executorId: string,
    executorRole: Role,
    taskId: string,
    updateData: Partial<Omit<Task, "id" | "createdAt" | "ownerId">>,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new Error("المهمة غير موجودة");

    if (executorRole === Role.ADMIN) {
      return this.taskRepository.update(taskId, updateData);
    }

    if (executorRole === Role.MANAGER) {
      if (task.ownerId !== executorId) {
        throw new Error("صلاحيات غير كافية: لا يمكنك تعديل مهمة لا تملكها");
      }
      return this.taskRepository.update(taskId, updateData);
    }

    if (executorRole === Role.MEMBER) {
      if (task.assigneeId !== executorId) {
        throw new Error(
          "صلاحيات غير كافية: لا يمكنك تعديل مهمة ليست مسندة إليك",
        );
      }
      const restrictedData = updateData.status
        ? { status: updateData.status }
        : {};
      if (Object.keys(restrictedData).length === 0) {
        throw new Error(
          "صلاحيات غير كافية: يحق للعضو تعديل حالة المهمة فقط (Status)",
        );
      }
      return this.taskRepository.update(taskId, restrictedData);
    }

    throw new Error("دور غير معروف");
  }

  async deleteTask(
    executorId: string,
    executorRole: Role,
    taskId: string,
  ): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new Error("المهمة غير موجودة");

    if (
      executorRole === Role.ADMIN ||
      (executorRole === Role.MANAGER && task.ownerId === executorId)
    ) {
      await this.taskRepository.delete(taskId);
      return;
    }

    throw new Error("صلاحيات غير كافية: لا يمكنك حذف هذه المهمة");
  }
}