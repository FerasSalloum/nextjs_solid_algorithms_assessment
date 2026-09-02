import { describe, it, expect, beforeEach, vi } from "vitest";
import { ActivityLogService } from "../../../src/application/services/ActivityLogService";
import { IActivityLogRepository } from "../../../src/domain/interfaces/IActivityLogRepository";
import { Role } from "@prisma/client";
import {
  mockActivityLog,
  mockAdminUser,
  mockProject,
  mockTask,
} from "@tests/unit/mocks/mockData";

describe("ActivityLogService_Unit_Tests", () => {
  let activityLogRepository: IActivityLogRepository;
  let activityLogService: ActivityLogService;

  const mockActivityLogWithUser = {
    ...mockActivityLog,
    user: mockAdminUser,
  };

  const mockActivityLogWithUserProjectTask = {
    ...mockActivityLog,
    user: mockAdminUser,
    project: mockProject,
    task: mockTask,
  };

  beforeEach(() => {
    activityLogRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
    };

    activityLogService = new ActivityLogService(activityLogRepository);
    vi.clearAllMocks();
  });
//   اختبار الدالة الاولى تسجيل الحدث
  describe("logActivity", () => {
    it("تسجيل الحدث و ارجاعة", async () => {
      const logData = {
        userId: mockAdminUser.id,
        action: "تحديث المهمة",
        projectId: mockProject.id,
        taskId: mockTask.id,
        metadata: {
          previousStatus: "TODO",
          newStatus: "IN_PROGRESS",
        },
      };

      vi.mocked(activityLogRepository.create).mockResolvedValue(
        mockActivityLog,
      );

      const result = await activityLogService.logActivity(logData);

      expect(activityLogRepository.create).toHaveBeenCalledWith(logData);
      expect(result).toEqual(mockActivityLog);
    });
  });

  
  // اختبار الدالة الثانية جلب جميع الاحداث
  
  describe("getLogs", () => {
    it("عرض كافة الانشطة للمشرف", async () => {
      vi.mocked(activityLogRepository.findAll).mockResolvedValue([
        mockActivityLogWithUser,
      ]);

      const result = await activityLogService.getLogs(Role.ADMIN);

      expect(activityLogRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockActivityLogWithUser]);
    });

    it("يجب أن يمرر الفلاتر إلى المستودع بشكل صحيح عند توفرها", async () => {
      const filters = { userId: mockAdminUser.id, limit: 10 };
      vi.mocked(activityLogRepository.findAll).mockResolvedValue([
        mockActivityLogWithUser,
      ]);

      await activityLogService.getLogs(Role.MANAGER, filters);

      expect(activityLogRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it("لا يسمج للاعضاء بعرض الاحداث", async () => {
      await expect(activityLogService.getLogs(Role.MEMBER)).rejects.toThrow(
        "صلاحيات غير كافية: لا يحق للأعضاء استعراض سجل الأنشطة",
      );

      expect(activityLogRepository.findAll).not.toHaveBeenCalled();
    });
  });

  
  // 3. اخبار الدالة الثالة جلب حدث بستخدام المعرف
  
  describe("getLogById", () => {
    it("ارجاع الحدث مع المعرف والصلاحيات المناسبة", async () => {
      vi.mocked(activityLogRepository.findById).mockResolvedValue(
        mockActivityLogWithUserProjectTask,
      );

      const result = await activityLogService.getLogById(
        Role.ADMIN,
        mockActivityLog.id,
      );

      expect(activityLogRepository.findById).toHaveBeenCalledWith(
        mockActivityLog.id,
      );
      expect(result).toEqual(mockActivityLogWithUserProjectTask);
    });

    it("منع الاعضاء من جلب اي حدث", async () => {
      await expect(
        activityLogService.getLogById(Role.MEMBER, mockActivityLog.id),
      ).rejects.toThrow(
        "صلاحيات غير كافية: لا يحق للأعضاء استعراض تفاصيل السجل",
      );

      expect(activityLogRepository.findById).not.toHaveBeenCalled();
    });

    it("خطاء النشاط غير موجود", async () => {
      vi.mocked(activityLogRepository.findById).mockResolvedValue(null);

      await expect(
        activityLogService.getLogById(Role.ADMIN, "non-existent-id"),
      ).rejects.toThrow("سجل النشاط غير موجود");

      expect(activityLogRepository.findById).toHaveBeenCalledWith(
        "non-existent-id",
      );
    });
  });
});
