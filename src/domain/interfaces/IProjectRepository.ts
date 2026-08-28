import { Project, ProjectStatus } from "@prisma/client";

export interface IProjectFilterOptions {
  status?: ProjectStatus;
  ownerId?: string;
  search?: string;
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(filters?: IProjectFilterOptions): Promise<Project[]>;
  create(data: { name: string; description?: string; ownerId: string; status?: ProjectStatus }): Promise<Project>;
  update(id: string, data: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project>;
  archive(id: string): Promise<Project>;
  delete(id: string): Promise<void>;
}