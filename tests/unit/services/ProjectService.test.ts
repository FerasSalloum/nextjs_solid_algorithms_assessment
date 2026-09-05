import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProjectService } from "../../../src/application/services/ProjectService";
import { createMockProjectRepository } from "@tests/unit/mocks/mockRepositories";
import {
  mockAdminUser,
  mockManagerUser,
  mockMemberUser,
  mockProject,
  mockProjectWithOwner,
} from "@tests/unit/mocks/mockData";
import { Role, ProjectStatus } from "@prisma/client";

describe("ProjectService_Unit_Tests", () => {
  let projectRepository: ReturnType<typeof createMockProjectRepository>;
  let projectService: ProjectService;

  beforeEach(() => {
    projectRepository = createMockProjectRepository();
    projectService = new ProjectService(projectRepository);
  });

  // 1. الاختبار الاول جلب المشروع بواسطة المعرف
  describe("getProjectById", () => {
    it("يجب أن يسترجع المشروع مع المالك بنجاح إذا كان موجوداً", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(
        mockProjectWithOwner,
      );

      const result = await projectService.getProjectById(mockProject.id);

      expect(projectRepository.findById).toHaveBeenCalledWith(mockProject.id);
      expect(result).toEqual(mockProjectWithOwner);
    });

    it("يجب أن يرمي خطأ إذا كان المشروع غير موجود", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(null);

      await expect(
        projectService.getProjectById("non-existent-id"),
      ).rejects.toThrow("المشروع غير موجود");
    });
  });

  // 2. اختبار الدالة الثانية جلب جميع الشاريع حسب الفلتر
  describe("getProjects", () => {
    it("يجب أن يسترجع قائمة المشاريع مع الفلاتر الممررة", async () => {
      const mockProjectsList = [mockProject];
      const filters = { status: ProjectStatus.ACTIVE };
      vi.mocked(projectRepository.findAll).mockResolvedValue(mockProjectsList);

      const result = await projectService.getProjects(filters);

      expect(projectRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockProjectsList);
    });
  });

  // اختبار الدالة الثالثة انشاء مشروع جديد

  describe("createProject", () => {
    const projectData = {
      name: "مشروع جديد",
      description: "وصف المشروع",
      ownerId: mockManagerUser.id,
      status: ProjectStatus.ACTIVE,
    };

    it("يسمح للمشرف بانشاء المشروع", async () => {
      vi.mocked(projectRepository.create).mockResolvedValue({
        ...mockProject,
        ...projectData,
      });

      const result = await projectService.createProject(
        Role.ADMIN,
        projectData,
      );

      expect(projectRepository.create).toHaveBeenCalledWith(projectData);
      expect(result.name).toBe(projectData.name);
    });

    it("يسمح للمدير بانشاء مشروع", async () => {
      vi.mocked(projectRepository.create).mockResolvedValue({
        ...mockProject,
        ...projectData,
      });

      const result = await projectService.createProject(
        Role.MANAGER,
        projectData,
      );

      expect(projectRepository.create).toHaveBeenCalledWith(projectData);
      expect(result.name).toBe(projectData.name);
    });

    it("لا يسمح للعضو بانشاء مشروع", async () => {
      await expect(
        projectService.createProject(Role.MEMBER, projectData),
      ).rejects.toThrow("صلاحيات غير كافية: لا يحق للأعضاء إنشاء مشاريع جديدة");

      expect(projectRepository.create).not.toHaveBeenCalled();
    });
  });

  //اختبار المهمة الرابعة التعديل على مشروع

  describe("updateProject", () => {
    it("خطاء اذا كان المشروع غير موجود", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(null);

      await expect(
        projectService.updateProject(
          mockAdminUser.id,
          Role.ADMIN,
          "invalid-id",
          {
            name: "اسم جديد",
          },
        ),
      ).rejects.toThrow("المشروع غير موجود");
    });

    it("يسمح للمشرف بتعديل اي مشروع", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(
        mockProjectWithOwner,
      );
      vi.mocked(projectRepository.update).mockResolvedValue({
        ...mockProject,
        name: "تعديل من قبل المشرف",
      });

      const result = await projectService.updateProject(
        mockAdminUser.id,
        Role.ADMIN,
        mockProject.id,
        { name: " تعديل من قبل المشرف" },
      );

      expect(projectRepository.update).toHaveBeenCalledWith(mockProject.id, {
        name: " تعديل من قبل المشرف",
      });
      expect(result.name).toBe("تعديل من قبل المشرف");
    });

    it("يسمح للمدير بتعديل مشروع يملكة ", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue({
        ...mockProjectWithOwner,
        ownerId: mockManagerUser.id,
      });
      vi.mocked(projectRepository.update).mockResolvedValue({
        ...mockProject,
        name: "تعديل من قبل المدير",
      });

      const result = await projectService.updateProject(
        mockManagerUser.id,
        Role.MANAGER,
        mockProject.id,
        { name: "تعديل من قبل المدير" },
      );

      expect(projectRepository.update).toHaveBeenCalledWith(mockProject.id, {
        name: "تعديل من قبل المدير",
      });
      expect(result.name).toBe("تعديل من قبل المدير");
    });

    it("لا يسمح للمدير بتعديل مشروع لم يقم بانشائة", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue({
        ...mockProjectWithOwner,
        ownerId: "other-manager-id",
      });

      await expect(
        projectService.updateProject(
          mockManagerUser.id,
          Role.MANAGER,
          mockProject.id,
          { name: "تعديل غير مسموح" },
        ),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك تعديل مشروع لا تملكه");

      expect(projectRepository.update).not.toHaveBeenCalled();
    });

    it("لا يسمح للعضو بتعديل المشاريع", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(
        mockProjectWithOwner,
      );

      await expect(
        projectService.updateProject(
          mockMemberUser.id,
          Role.MEMBER,
          mockProject.id,
          { name: "تعديل غير مسموح" },
        ),
      ).rejects.toThrow("صلاحيات غير كافية: لا يحق للأعضاء تعديل المشاريع");

      expect(projectRepository.update).not.toHaveBeenCalled();
    });
  });

  //   اختبار الدالة الخامسة ارشفة مشروع
  describe("archiveProject", () => {
    it("خطاء المشروع غير موجود", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(null);

      await expect(
        projectService.archiveProject(
          mockAdminUser.id,
          Role.ADMIN,
          "invalid-id",
        ),
      ).rejects.toThrow("المشروع غير موجود");
    });

    it("يسمح للمشرف بارشفة اي مشروع", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(
        mockProjectWithOwner,
      );
      vi.mocked(projectRepository.archive).mockResolvedValue({
        ...mockProject,
        status: ProjectStatus.ARCHIVED,
      });

      const result = await projectService.archiveProject(
        mockAdminUser.id,
        Role.ADMIN,
        mockProject.id,
      );

      expect(projectRepository.archive).toHaveBeenCalledWith(mockProject.id);
      expect(result.status).toBe(ProjectStatus.ARCHIVED);
    });

    it("يسمح للمدير بارشفة مشروع يملكة", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue({
        ...mockProjectWithOwner,
        ownerId: mockManagerUser.id,
      });
      vi.mocked(projectRepository.archive).mockResolvedValue({
        ...mockProject,
        status: ProjectStatus.ARCHIVED,
      });

      const result = await projectService.archiveProject(
        mockManagerUser.id,
        Role.MANAGER,
        mockProject.id,
      );

      expect(projectRepository.archive).toHaveBeenCalledWith(mockProject.id);
      expect(result.status).toBe(ProjectStatus.ARCHIVED);
    });

    it("لا يسمح للمدير بارشفة مشروع لايملكة", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue({
        ...mockProjectWithOwner,
        ownerId: "other-manager-id",
      });

      await expect(
        projectService.archiveProject(
          mockManagerUser.id,
          Role.MANAGER,
          mockProject.id,
        ),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك أرشفة هذا المشروع");

      expect(projectRepository.archive).not.toHaveBeenCalled();
    });

    it("يجب أن يمنع العضو (MEMBER) من أرشفة المشروع", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(
        mockProjectWithOwner,
      );

      await expect(
        projectService.archiveProject(
          mockMemberUser.id,
          Role.MEMBER,
          mockProject.id,
        ),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك أرشفة هذا المشروع");

      expect(projectRepository.archive).not.toHaveBeenCalled();
    });
  });

  //   اختبار الدالة السادسة حذف مشروع
  describe("deleteProject", () => {
    it("خطاء المشروع غير موجود", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(null);

      await expect(
        projectService.deleteProject(Role.ADMIN, "invalid-id"),
      ).rejects.toThrow("المشروع غير موجود");
    });

    it("يحق للمشرف فقط ان يحذف المشروع", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(
        mockProjectWithOwner,
      );
      vi.mocked(projectRepository.delete).mockResolvedValue();

      await projectService.deleteProject(Role.ADMIN, mockProject.id);

      expect(projectRepository.delete).toHaveBeenCalledWith(mockProject.id);
    });

    it("لا يحق للمدير اان يحذف المشروع", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue({
        ...mockProjectWithOwner,
        ownerId: mockManagerUser.id,
      });

      await expect(
        projectService.deleteProject(Role.MANAGER, mockProject.id),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك حذف هذا المشروع");

      expect(projectRepository.delete).not.toHaveBeenCalled();
    });

    it("يجب أن يمنع العضو (MEMBER) من حذف المشروع", async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(
        mockProjectWithOwner,
      );

      await expect(
        projectService.deleteProject(Role.MEMBER, mockProject.id),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك حذف هذا المشروع");

      expect(projectRepository.delete).not.toHaveBeenCalled();
    });
  });
});
