import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProjectAnalyticsService } from "@/src/application/services/ProjectAnalyticsService";
import { IProjectRepository } from "@/src/domain/interfaces/IProjectRepository";
import { ITaskRepository } from "@/src/domain/interfaces/ITaskRepository";
import { NotFoundError, ForbiddenError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";
import { mockProjectWithOwner } from "../mocks/mockData";

describe("Service: ProjectAnalyticsService", () => {
  let projectRepositoryMock: IProjectRepository;
  let taskRepositoryMock: ITaskRepository;
  let service: ProjectAnalyticsService;

  beforeEach(() => {
    projectRepositoryMock = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      delete: vi.fn(),
    };

    taskRepositoryMock = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new ProjectAnalyticsService(
      projectRepositoryMock,
      taskRepositoryMock,
    );
  });

  it("يجب أن يرمي NotFoundError إذا لم يتم العثور على المشروع", async () => {
    vi.mocked(projectRepositoryMock.findById).mockResolvedValue(null);

    await expect(
      service.getProjectAnalytics("user-1", Role.ADMIN, "non-existent"),
    ).rejects.toThrow(NotFoundError);
  });

  it("يجب أن يرمي ForbiddenError إذا لم يكن المستخدم مديراً أو مالكاً للمشروع", async () => {
    vi.mocked(projectRepositoryMock.findById).mockResolvedValue(
      mockProjectWithOwner,
    );

    await expect(
      service.getProjectAnalytics("stranger-user", Role.MEMBER, "p-1"),
    ).rejects.toThrow(ForbiddenError);
  });

  it("يجب أن يعيد التحليلات بنجاح للمستخدم المصرح له", async () => {
    vi.mocked(projectRepositoryMock.findById).mockResolvedValue(
      mockProjectWithOwner,
    );
    vi.mocked(taskRepositoryMock.findAll).mockResolvedValue([]); // مصفوفة مهام فارغة للاختبار السريع

    const result = await service.getProjectAnalytics(
      "admin-123",
      Role.ADMIN,
      "p-1",
    );

    expect(result).toHaveProperty("projectId", "project-123");
    expect(result).toHaveProperty("projectName", "مشروع تطوير النظام");
    expect(result).toHaveProperty("totalTasks", 0);
    expect(result).toHaveProperty("healthScore", "HEALTHY");
  });
});
