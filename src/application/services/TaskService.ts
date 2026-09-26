import {
  ITaskRepository,
  ITaskFilterOptions,
} from "@/src/domain/interfaces/ITaskRepository";
import { TaskWithAssigneeOwner } from "@/src/types/TaskRepository";
import { Task, TaskStatus, Priority, Role } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  AppError,
} from "@/src/domain/errors/AppError";
import { eventBus } from "@/src/infrastructure/events/EventBus";
import {
  ACTIVITY_EVENTS,
  TaskCreatedPayload,
  TaskDeletedPayload,
  TaskUpdatedPayload,
} from "@/src/domain/events/ActiviteEvents";

export class TaskService {
  constructor(private taskRepository: ITaskRepository) {}

  async getTaskById(id: string): Promise<TaskWithAssigneeOwner> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError("المهمة غير موجودة");
    }
    return task;
  }

  async getTasks(filters?: ITaskFilterOptions): Promise<Task[]> {
    return this.taskRepository.findAll(filters);
  }

  async getTaskWithAssigneeOwner(
    filters?: ITaskFilterOptions,
  ): Promise<TaskWithAssigneeOwner[]> {
    return this.taskRepository.findMany(filters);
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
      const newTask = await this.taskRepository.create(data);
      const payload: TaskCreatedPayload = {
        userId: data.ownerId,
        taskId: newTask.id,
        projectId: newTask.projectId,
      };
      eventBus.emit(ACTIVITY_EVENTS.TASK_CREATED, payload);
      return newTask;
    }

    throw new ForbiddenError("صلاحيات غير كافية: لا يمكنك إنشاء المهام");
  }

  async updateTask(
    executorId: string,
    executorRole: Role,
    taskId: string,
    updateData: Partial<Omit<Task, "id" | "createdAt" | "ownerId">>,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("المهمة غير موجودة");
    }

    if (executorRole === Role.ADMIN) {
      const newTask = await this.taskRepository.update(taskId, updateData);
      const payload: TaskUpdatedPayload = {
        userId: executorId,
        taskId: taskId,
        projectId: newTask.projectId,
        oldInfo: task,
      };
      eventBus.emit(ACTIVITY_EVENTS.TASK_UPDATED, payload);
      return newTask;
    }

    if (executorRole === Role.MANAGER) {
      if (task.ownerId !== executorId) {
        throw new ForbiddenError(
          "صلاحيات غير كافية: لا يمكنك تعديل مهمة لا تملكها",
        );
      }
      const newTask = await this.taskRepository.update(taskId, updateData);
      const payload: TaskUpdatedPayload = {
        userId: executorId,
        taskId: taskId,
        projectId: newTask.projectId,
        oldInfo: task,
      };
      eventBus.emit(ACTIVITY_EVENTS.TASK_UPDATED, payload);
      return newTask;
    }

    if (executorRole === Role.MEMBER) {
      if (task.assigneeId !== executorId) {
        throw new ForbiddenError(
          "صلاحيات غير كافية: لا يمكنك تعديل مهمة ليست مسندة إليك",
        );
      }
      const restrictedData = updateData.status
        ? { status: updateData.status }
        : {};
      if (Object.keys(restrictedData).length === 0) {
        throw new ForbiddenError(
          "صلاحيات غير كافية: يحق للعضو تعديل حالة المهمة فقط (Status)",
        );
      }
      const newTask = await this.taskRepository.update(taskId, restrictedData);
      const payload: TaskUpdatedPayload = {
        userId: executorId,
        taskId: taskId,
        projectId: newTask.projectId,
        oldInfo: task,
      };
      eventBus.emit(ACTIVITY_EVENTS.TASK_UPDATED, payload);
      return newTask;
    }

    throw new AppError("دور غير معروف", 400);
  }

  async deleteTask(
    executorId: string,
    executorRole: Role,
    taskId: string,
  ): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("المهمة غير موجودة");
    }

    if (
      executorRole === Role.ADMIN ||
      (executorRole === Role.MANAGER && task.ownerId === executorId)
    ) {
      await this.taskRepository.delete(taskId);
      const payload: TaskDeletedPayload = {
        userId: executorId,
        taskId: taskId,
        projectId: task.projectId,
        oldInfo: task,
      };
      eventBus.emit(ACTIVITY_EVENTS.TASK_DELETED, payload);
      return;
    }

    throw new ForbiddenError("صلاحيات غير كافية: لا يمكنك حذف هذه المهمة");
  }
}
