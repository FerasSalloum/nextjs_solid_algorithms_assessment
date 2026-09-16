import {
  IProjectRepository,
  IProjectFilterOptions,
} from "@/src/domain/interfaces/IProjectRepository";
import { ProjectWithOwner } from "@/src/types/ProjectRepository";
import { Project, ProjectStatus, Role } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/src/domain/errors/AppError";
import {
  ACTIVITY_EVENTS,
  ProjectArchivedPayload,
  ProjectCreatedPayload,
  ProjectDeletedPayload,
  ProjectUpdatedPayload,
} from "@/src/domain/events/ActiviteEvents";
import { eventBus } from "@/src/infrastructure/events/EventBus";

export class ProjectService {
  constructor(private projectRepository: IProjectRepository) {}

  async getProjectById(id: string): Promise<ProjectWithOwner> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError("المشروع غير موجود");
    }
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
      throw new ForbiddenError(
        "صلاحيات غير كافية: لا يحق للأعضاء إنشاء مشاريع جديدة",
      );
    }
    const newProject = await this.projectRepository.create(data);
    const payload: ProjectCreatedPayload = {
      userId: newProject.ownerId,
      projectId: newProject.id,
    };
    eventBus.emit(ACTIVITY_EVENTS.PROJECT_CREATED, payload);
    return newProject;
  }

  async updateProject(
    executorId: string,
    executorRole: Role,
    projectId: string,
    updateData: Partial<Omit<Project, "id" | "createdAt">>,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("المشروع غير موجود");
    }

    if (executorRole === Role.ADMIN) {
      const newProject = await this.projectRepository.update(
        projectId,
        updateData,
      );
      const payload: ProjectUpdatedPayload = {
        userId: newProject.ownerId,
        projectId: newProject.id,
        oldInfo: project,
      };
      eventBus.emit(ACTIVITY_EVENTS.PROJECT_UPDATED, payload);
      return newProject;
    }

    if (executorRole === Role.MANAGER) {
      if (project.ownerId !== executorId) {
        throw new ForbiddenError(
          "صلاحيات غير كافية: لا يمكنك تعديل مشروع لا تملكه",
        );
      }
      const newProject = await this.projectRepository.update(
        projectId,
        updateData,
      );
      const payload: ProjectUpdatedPayload = {
        userId: newProject.ownerId,
        projectId: newProject.id,
        oldInfo: project,
      };
      eventBus.emit(ACTIVITY_EVENTS.PROJECT_UPDATED, payload);
      return newProject;
    }

    throw new ForbiddenError(
      "صلاحيات غير كافية: لا يحق للأعضاء تعديل المشاريع",
    );
  }

  async archiveProject(
    executorId: string,
    executorRole: Role,
    projectId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("المشروع غير موجود");
    }

    if (
      executorRole === Role.ADMIN ||
      (executorRole === Role.MANAGER && project.ownerId === executorId)
    ) {
      const newProject = await this.projectRepository.archive(projectId);
      const payload: ProjectArchivedPayload = {
        userId: executorId,
        projectId: newProject.id,
      };
      eventBus.emit(ACTIVITY_EVENTS.PROJECT_ARCHIVED, payload);
      return newProject;
    }
    throw new ForbiddenError("صلاحيات غير كافية: لا يمكنك أرشفة هذا المشروع");
  }

  async deleteProject(executorRole: Role, projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("المشروع غير موجود");
    }

    if (executorRole === Role.ADMIN) {
      await this.projectRepository.delete(projectId);
      const payload: ProjectDeletedPayload = {
        userId: executorRole,
        projectId: project.id,
      };
      eventBus.emit(ACTIVITY_EVENTS.PROJECT_DELETED, payload);
      return;
    }

    throw new ForbiddenError("صلاحيات غير كافية: لا يمكنك حذف هذا المشروع");
  }
}
