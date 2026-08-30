import { TaskWithAssigneeProjectOwner } from "@/src/types/TaskRepository";
import { Task, TaskStatus, Priority } from "@prisma/client";

export interface ITaskFilterOptions {
  projectId?: string;
  assigneeId?: string;
  ownerId?: string;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
}

export interface ITaskRepository {
  findById(id: string): Promise<TaskWithAssigneeProjectOwner | null>;
  findAll(filters?: ITaskFilterOptions): Promise<Task[]>;
  create(data: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    ownerId: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: Date;
    estimatedHours?: number;
  }): Promise<Task>;
  update(
    id: string,
    data: Partial<Omit<Task, "id" | "createdAt" | "ownerId">>,
  ): Promise<Task>;
  delete(id: string): Promise<void>;
}
