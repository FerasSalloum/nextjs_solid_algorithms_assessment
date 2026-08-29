import { prisma } from "@/src/lib/prisma";
import {
  IProjectRepository,
  IProjectFilterOptions,
} from "@/src/domain/interfaces/IProjectRepository";
import { Project, ProjectStatus } from "@prisma/client";
import { ProjectWithOwner } from "@/src/types/ProjectRepository";

export class ProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<ProjectWithOwner | null> {
    return prisma.project.findUnique({
      where: { id },
      include: { owner: true },
    });
  } 

  async findAll(filters?: IProjectFilterOptions): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.ownerId && { ownerId: filters.ownerId }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    ownerId: string;
    status?: ProjectStatus;
  }): Promise<Project> {
    return prisma.project.create({ data });
  }

  async update(
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt">>,
  ): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  }

  async archive(id: string): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
}
