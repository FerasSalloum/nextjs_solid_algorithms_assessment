import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskService } from "../../../src/application/services/TaskService";
import { createMockTaskRepository } from "@tests/unit/mocks/mockRepositories";
import {
  mockAdminUser,
  mockManagerUser,
  mockMemberUser,
  mockTask,
  mockTaskWithAssigneeProjectOwner,
} from "@tests/unit/mocks/mockData";
import { Role, TaskStatus } from "@prisma/client";

describe("TaskService_UnitTests", () => {
  let taskRepository: ReturnType<typeof createMockTaskRepository>;
  let taskService: TaskService;

  beforeEach(() => {
    taskRepository = createMockTaskRepository();
    taskService = new TaskService(taskRepository);
  });

  //  اختبار الدالة الاولى جلب التاسك بواسطة المعرف
  describe("getTaskById", () => {
    it("المعرف موجود الاختبار يمر بنجاح", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(
        mockTaskWithAssigneeProjectOwner,
      );

      const result = await taskService.getTaskById(mockTask.id);

      expect(taskRepository.findById).toHaveBeenCalledWith(mockTask.id);
      expect(result).toEqual(mockTaskWithAssigneeProjectOwner);
    });

    it("نيرمي خطأ إذا كانت المهمة غير موجودة", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(taskService.getTaskById("non-existent-id")).rejects.toThrow(
        "المهمة غير موجودة",
      );
    });
  });

  // اختبار الدالة الثانية جلب جميع التاسكات حسب الفلتر

  describe("getTasks", () => {
    it("يجب أن يسترجع قائمة المهام بحسب الفلاتر الممررة", async () => {
      const mockTaskList = [mockTask];
      const filters = { status: TaskStatus.TODO };
      vi.mocked(taskRepository.findAll).mockResolvedValue(mockTaskList);

      const result = await taskService.getTasks(filters);

      expect(taskRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockTaskList);
    });
  });

  // اختبار الدالة الثالة انشاء تاسك جديد
  describe("createTask", () => {
    const taskData = {
      title: "مهمة جديدة",
      projectId: "project-123",
      ownerId: mockAdminUser.id,
    };

    it("يجب ان يسمح للمشرف بانشاء مهمة", async () => {
      vi.mocked(taskRepository.create).mockResolvedValue({
        ...mockTask,
        ...taskData,
      });

      const result = await taskService.createTask(Role.ADMIN, taskData);

      expect(taskRepository.create).toHaveBeenCalledWith(taskData);
      expect(result.title).toBe(taskData.title);
    });

    it("يجب ان يسمح للمدير بانشاء مهمة", async () => {
      vi.mocked(taskRepository.create).mockResolvedValue({
        ...mockTask,
        ...taskData,
      });

      const result = await taskService.createTask(Role.MANAGER, taskData);

      expect(taskRepository.create).toHaveBeenCalledWith(taskData);
      expect(result.title).toBe(taskData.title);
    });

    it("لا يجب ان يسمح للعضو بانشاء مهمة ويرمي خطاء", async () => {
      await expect(
        taskService.createTask(Role.MEMBER, taskData),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك إنشاء المهام");

      expect(taskRepository.create).not.toHaveBeenCalled();
    });
  });

  // اختبار الدالة الرابعة تحديث بيانات تاسك محدد
  describe("updateTask", () => {
    it("يجب أن يرمي خطأ في حالة المهمة غير موجودة", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.updateTask(mockAdminUser.id, Role.ADMIN, "invalid-id", {
          title: "تعديل",
        }),
      ).rejects.toThrow("المهمة غير موجودة");
    });

    it("يجب ان يسمح للمشرف بتعديل المهمة", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(
        mockTaskWithAssigneeProjectOwner,
      );
      vi.mocked(taskRepository.update).mockResolvedValue({
        ...mockTask,
        title: "تعديل بواسطة المشرف",
      });

      const result = await taskService.updateTask(
        mockAdminUser.id,
        Role.ADMIN,
        mockTask.id,
        { title: "تعديل بواسطة المشرف" },
      );

      expect(taskRepository.update).toHaveBeenCalledWith(mockTask.id, {
        title: "تعديل بواسطة المشرف",
      });
      expect(result.title).toBe("تعديل بواسطة المشرف");
    });

    it("يجب ان يسمح للمدير بتعديل مهمة يملكها", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue({
        ...mockTaskWithAssigneeProjectOwner,
        ownerId: mockManagerUser.id,
      });
      vi.mocked(taskRepository.update).mockResolvedValue({
        ...mockTask,
        title: "عنوان معدل بواسطة مدير",
      });

      const result = await taskService.updateTask(
        mockManagerUser.id,
        Role.MANAGER,
        mockTask.id,
        { title: "عنوان معدل بواسطة مدير" },
      );

      expect(taskRepository.update).toHaveBeenCalledWith(mockTask.id, {
        title: "عنوان معدل بواسطة مدير",
      });
      expect(result.title).toBe("عنوان معدل بواسطة مدير");
    });

    it("لا يحق للمدير ان يعدل مهمة لم يكن قد قام بانشائها", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue({
        ...mockTaskWithAssigneeProjectOwner,
        ownerId: "other-manager-id",
      });

      await expect(
        taskService.updateTask(mockManagerUser.id, Role.MANAGER, mockTask.id, {
          title: "تعديل محظور",
        }),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك تعديل مهمة لا تملكها");

      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it("تعديل المهمة بواسطة عضو مسندة اليه المهمة", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue({
        ...mockTaskWithAssigneeProjectOwner,
        assigneeId: mockMemberUser.id,
      });
      vi.mocked(taskRepository.update).mockResolvedValue({
        ...mockTask,
        status: TaskStatus.IN_PROGRESS,
      });

      const result = await taskService.updateTask(
        mockMemberUser.id,
        Role.MEMBER,
        mockTask.id,
        { status: TaskStatus.IN_PROGRESS },
      );

      expect(taskRepository.update).toHaveBeenCalledWith(mockTask.id, {
        status: TaskStatus.IN_PROGRESS,
      });
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("لا يحق لعضو تعديل مهمة غير مسندة الية", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue({
        ...mockTaskWithAssigneeProjectOwner,
        assigneeId: "other-member-id",
      });

      await expect(
        taskService.updateTask(mockMemberUser.id, Role.MEMBER, mockTask.id, {
          status: TaskStatus.IN_PROGRESS,
        }),
      ).rejects.toThrow(
        "صلاحيات غير كافية: لا يمكنك تعديل مهمة ليست مسندة إليك",
      );

      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it("لا يحق للعضو تعديل اي شيء سوا الحالة ", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue({
        ...mockTaskWithAssigneeProjectOwner,
        assigneeId: mockMemberUser.id,
      });

      await expect(
        taskService.updateTask(mockMemberUser.id, Role.MEMBER, mockTask.id, {
          title: "عنوان جديد غير مسموح",
        }),
      ).rejects.toThrow(
        "صلاحيات غير كافية: يحق للعضو تعديل حالة المهمة فقط (Status)",
      );

      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it("انشاء خطاء في حال كان الدور غير موجود", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(
        mockTaskWithAssigneeProjectOwner,
      );

      await expect(
        taskService.updateTask(
          "user-123",
          "UNKNOWN_ROLE" as Role,
          mockTask.id,
          { status: TaskStatus.DONE },
        ),
      ).rejects.toThrow("دور غير معروف");
    });
  });

  // اختبار الدالة الخامسة جذف مهمة
  describe("deleteTask", () => {
    it("خطاء في حال كانت المهمة غير موجودة ", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.deleteTask(mockAdminUser.id, Role.ADMIN, "invalid-id"),
      ).rejects.toThrow("المهمة غير موجودة");
    });

    it("يحق للمشرف حذف اي مهمة", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(
        mockTaskWithAssigneeProjectOwner,
      );
      vi.mocked(taskRepository.delete).mockResolvedValue();

      await taskService.deleteTask(mockAdminUser.id, Role.ADMIN, mockTask.id);

      expect(taskRepository.delete).toHaveBeenCalledWith(mockTask.id);
    });

    it("يحق للمدير حذف المهام التي قام بانشائها", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue({
        ...mockTaskWithAssigneeProjectOwner,
        ownerId: mockManagerUser.id,
      });
      vi.mocked(taskRepository.delete).mockResolvedValue();

      await taskService.deleteTask(
        mockManagerUser.id,
        Role.MANAGER,
        mockTask.id,
      );

      expect(taskRepository.delete).toHaveBeenCalledWith(mockTask.id);
    });

    it("لا يحق للمدير حذف مهمة لم يقم بانشائها", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue({
        ...mockTaskWithAssigneeProjectOwner,
        ownerId: "other-manager-id",
      });

      await expect(
        taskService.deleteTask(mockManagerUser.id, Role.MANAGER, mockTask.id),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك حذف هذه المهمة");

      expect(taskRepository.delete).not.toHaveBeenCalled();
    });

    it("لا يحق للعضو ان يحذف اي مهمة ", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(
        mockTaskWithAssigneeProjectOwner,
      );

      await expect(
        taskService.deleteTask(mockMemberUser.id, Role.MEMBER, mockTask.id),
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك حذف هذه المهمة");

      expect(taskRepository.delete).not.toHaveBeenCalled();
    });
  });
});
