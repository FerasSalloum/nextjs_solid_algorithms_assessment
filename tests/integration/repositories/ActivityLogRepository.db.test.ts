import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { ActivityLogRepository } from "@/src/infrastructure/repositories/ActivityLogRepository";
import {
  mockManagerUser,
  mockMemberUser,
  mockProject,
  mockTask,
} from "@/tests/unit/mocks/mockData";

const baseLogInput = {
  id: "ActivityLog-123",
  taskId: mockTask.id,
  projectId: mockProject.id,
  userId: mockManagerUser.id,
  action: "تحديث",
  createdAt: new Date("2026-01-01"),
  metadata: {
    previousStatus: "TODO",
    newStatus: "IN_PROGRESS",
    changedFields: ["status"],
  },
};

describe("ActivityLogRepository_Real_Database_Integration Test", () => {
  const activityLogRepository = new ActivityLogRepository();

  beforeEach(async () => {
    await prisma.activityLog.deleteMany();
    await prisma.taskComment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    
    await Promise.all([
      prisma.user.create({ data: mockManagerUser }),
      prisma.user.create({ data: mockMemberUser }),
    ]);
    await prisma.project.create({ data: mockProject });
    await prisma.task.create({ data: mockTask });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. اختبار إنشاء سجل نشاط جديد
  describe("create", () => {
    it("يحفظ سجل النشاط بنجاح مع البيانات الالزامية او الاختيارية", async () => {
      const createdLog = await activityLogRepository.create(baseLogInput);

      expect(createdLog).toBeDefined();
      expect(createdLog.id).toBeDefined();
      expect(createdLog.action).toBe(baseLogInput.action);
      expect(createdLog.userId).toBe(mockManagerUser.id);
      expect(createdLog.projectId).toBe(mockProject.id);
      expect(createdLog.taskId).toBe(mockTask.id);
      expect(createdLog.metadata).toEqual(baseLogInput.metadata);

      const dbLog = await prisma.activityLog.findUnique({
        where: { id: createdLog.id },
      });
      expect(dbLog).not.toBeNull();
    });

    it("يحفظ السجل بنجاح عند عدم تمرير البيانات الاختيارية", async () => {
      const minimalLog = await activityLogRepository.create({
        userId: mockMemberUser.id,
        action: "LOG_IN",
      });

      expect(minimalLog.id).toBeDefined();
      expect(minimalLog.projectId).toBeNull();
      expect(minimalLog.taskId).toBeNull();
      expect(minimalLog.metadata).toBeNull();
    });
  });

  // 2. اختبار البحث بواسطة المعرف مع العلاقات  

  describe("findById", () => {
    it(" يجلب النشاط مع التفاصيل ", async () => {
      const createdLog = await prisma.activityLog.create({
        data: {
          ...baseLogInput,
          id: "log-123",
          metadata: baseLogInput.metadata,
        },
      });

      const foundLog = await activityLogRepository.findById(createdLog.id);

      expect(foundLog).not.toBeNull();
      expect(foundLog?.id).toBe(createdLog.id);

      expect(foundLog?.user).toBeDefined();
      expect(foundLog?.user?.id).toBe(mockManagerUser.id);
      expect(foundLog?.user?.name).toBe(mockManagerUser.name);

      expect(foundLog?.project).toBeDefined();
      expect(foundLog?.project?.id).toBe(mockProject.id);

      expect(foundLog?.task).toBeDefined();
      expect(foundLog?.task?.id).toBe(mockTask.id);
    });

    it("يرجع قيمة فارغة إذا كان معرف السجل غير موجود", async () => {
      const foundLog = await activityLogRepository.findById(
        "non-existent-log-id",
      );
      expect(foundLog).toBeNull();
    });
  });

  // 3. اختبار الفلاتر
    describe("findAll", () => {
    beforeEach(async () => {
      await Promise.all([
        prisma.activityLog.create({
          data: {
            id: "log-1",
            userId: mockManagerUser.id,
            action: "UPDATE_PROJECT",
            projectId: mockProject.id,
            createdAt: new Date("2026-01-01"),
          },
        }),
        prisma.activityLog.create({
          data: {
            id: "log-2",
            userId: mockMemberUser.id,
            action: "COMPLETE_TASK",
            taskId: mockTask.id,
            createdAt: new Date("2026-01-02"),
          },
        }),
      ]);
    });

    it("يجلب كافة الانشطة مرتبة تنازلياً حسب التاريخ", async () => {
      const logs = await activityLogRepository.findAll();

      expect(logs).toHaveLength(2);
      expect(logs[0].id).toBe("log-2"); 
      expect(logs[1].id).toBe("log-1");

      expect(logs[0].user).toBeDefined();
      expect(logs[0].user.email).toBeDefined();
    });

    it("يجب أن يصفّي السجلات بناءً على معرف المستخدم و الحدث", async () => {
      const filteredLogs = await activityLogRepository.findAll({
        userId: mockMemberUser.id,
        action: "COMPLETE_TASK",
      });

      expect(filteredLogs).toHaveLength(1);
      expect(filteredLogs[0].id).toBe("log-2");
      expect(filteredLogs[0].action).toBe("COMPLETE_TASK");
    });

    it("يجب أن يطبق يجلب العدد المحدد", async () => {
      const limitedLogs = await activityLogRepository.findAll({
        limit: 1,
      });

      expect(limitedLogs).toHaveLength(1);
      expect(limitedLogs[0].id).toBe("log-2"); 
    });
  });
});
