import {
  IProjectRepository,
  IProjectFilterOptions,
} from "@/src/domain/interfaces/IProjectRepository";
import { ProjectWithOwner } from "@/src/types/ProjectRepository";
import { Project, ProjectStatus, Role } from "@prisma/client";

export class ProjectService {
  constructor(private projectRepository: IProjectRepository) {}

  async getProjectById(id: string): Promise<ProjectWithOwner | null> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new Error("المشروع غير موجود");
    return project;
  }

  async getProjects(filters?: IProjectFilterOptions): Promise<Project[]> {
    return this.projectRepository.findAll(filters);
  }
  async createProject(
    executorRole: Role,
    data: {
      name: string;
      description?: string;
      ownerId: string;
      status?: ProjectStatus;
    },
  ): Promise<Project> {
    if (executorRole === Role.MEMBER) {
      throw new Error("صلاحيات غير كافية: لا يحق للأعضاء إنشاء مشاريع جديدة");
    }

    return this.projectRepository.create(data);
  }

  async updateProject(
    executorId: string,
    executorRole: Role,
    projectId: string,
    updateData: Partial<Omit<Project, "id" | "createdAt">>,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error("المشروع غير موجود");

    if (executorRole === Role.ADMIN) {
      return this.projectRepository.update(projectId, updateData);
    }

    if (executorRole === Role.MANAGER) {
      if (project.ownerId !== executorId) {
        throw new Error("صلاحيات غير كافية: لا يمكنك تعديل مشروع لا تملكه");
      }
      return this.projectRepository.update(projectId, updateData);
    }

    throw new Error("صلاحيات غير كافية: لا يحق للأعضاء تعديل المشاريع");
  }

  // 5. أرشفة مشروع
  async archiveProject(
    executorId: string,
    executorRole: Role,
    projectId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error("المشروع غير موجود");

    if (
      executorRole === Role.ADMIN ||
      (executorRole === Role.MANAGER && project.ownerId === executorId)
    ) {
      return this.projectRepository.archive(projectId);
    }

    throw new Error("صلاحيات غير كافية: لا يمكنك أرشفة هذا المشروع");
  }

  async deleteProject(
    executorRole: Role,
    projectId: string,
  ): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error("المشروع غير موجود");

    if (executorRole === Role.ADMIN) {
      await this.projectRepository.delete(projectId);
      return;
    }

    throw new Error("صلاحيات غير كافية: لا يمكنك حذف هذا المشروع");
  }
}
