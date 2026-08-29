import { prisma } from "@/src/lib/prisma";
import { ITaskRepository, ITaskFilterOptions } from "@/src/domain/interfaces/ITaskRepository";
import { Task, TaskStatus, Priority } from "@prisma/client";
import { TaskWithAssigneeProject } from "@/src/types/TaskRepository";

export class TaskRepository implements ITaskRepository {
  async findById(id: string): Promise<TaskWithAssigneeProject | null> {
    return prisma.task.findUnique({
      where: { id },
      include: { assignee: true, project: true },
    });
  }
  

  async findAll(filters?: ITaskFilterOptions): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        ...(filters?.projectId && { projectId: filters.projectId }),
        ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: Date;
    estimatedHours?: number;
  }): Promise<Task> {
    return prisma.task.create({ data });
  }

  async update(id: string, data: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task> {
    return prisma.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }
}