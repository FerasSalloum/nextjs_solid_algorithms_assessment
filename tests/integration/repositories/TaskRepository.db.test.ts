// tests/integration/repositories/TaskRepository.db.test.ts

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { TaskRepository } from "@/src/infrastructure/repositories/TaskRepository";
import { TaskStatus, Priority } from "@prisma/client";
import {
  mockManagerUser,
  mockMemberUser,
  mockProject,
  mockTask,
} from "@/tests/unit/mocks/mockData";

const taskData = {
  title: "كتابة اختبارات الذكاء",
  description: "وصف المهمة للتحقق من الوظائف",
  status: TaskStatus.IN_PROGRESS,
  priority: Priority.HIGH,
  projectId: mockProject.id,
  ownerId: mockManagerUser.id,
  assigneeId: mockMemberUser.id,
  dueDate: new Date("2026-12-31"),
  estimatedHours: 5,
};

describe("TaskRepository - Real Database Integration Test", () => {
  const taskRepository = new TaskRepository();

  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    await Promise.all([
      prisma.user.create({ data: mockManagerUser }),
      prisma.user.create({ data: mockMemberUser }),
    ]);

    await prisma.project.create({ data: mockProject });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. اختبار إنشاء مهمة
  describe("create", () => {
    it("تحفظ المهمة بنجاح مع المشروع والمالك", async () => {
      const createdTask = await taskRepository.create(taskData);

      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.projectId).toBe(taskData.projectId);
      expect(createdTask.status).toBe(TaskStatus.IN_PROGRESS);

      const dbTask = await prisma.task.findUnique({
        where: { id: createdTask.id },
      });
      expect(dbTask).not.toBeNull();
    });
  });

  // 2. اختبار البحث بواسطة المعرف مع العلاقات

  describe("findById", () => {
    it("يجلب المهمة مع البيانات ", async () => {
      await prisma.task.create({
        data: mockTask,
      });

      const foundTask = await taskRepository.findById(mockTask.id);

      expect(foundTask).not.toBeNull();
      expect(foundTask?.id).toBe(mockTask.id);

      expect(foundTask?.owner).toBeDefined();
      expect(foundTask?.owner?.id).toBe(mockTask.ownerId);
      expect(foundTask?.project).toBeDefined();
      expect(foundTask?.project?.id).toBe(mockTask.projectId);
      expect(foundTask?.assignee?.id).toBe(mockTask.assigneeId);
    });

    it("يرجع قيمة فارغة إذا كان معرف المهمة غير موجود", async () => {
      const foundTask = await taskRepository.findById("non-existent-task-id");
      expect(foundTask).toBeNull();
    });
  });

  // 3. اختبار الاستعلام الفلاتر
  describe("findAll", () => {
    beforeEach(async () => {
      await Promise.all([
        prisma.task.create({
          data: { ...taskData, id: "task-123" },
        }),
        prisma.task.create({
          data: {
            ...taskData,
            id: "task-123123",
            status: TaskStatus.TODO,
            title: "مهمة اختبار TODO",
          },
        }),
      ]);
    });

    it("يجلب كافة المهام مرتبة التاريخ", async () => {
      const tasks = await taskRepository.findAll();
      expect(tasks).toHaveLength(2);
    });

    it("يجلب المهام حسب الحالة والاهمبة ", async () => {
      const filteredTasks = await taskRepository.findAll({
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
      });

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].title).toBe("مهمة اختبار TODO");
    });

    it("البحث عبر الكلمات", async () => {
      const searchResults = await taskRepository.findAll({
        search: "الذكاء",
      });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe("كتابة اختبارات الذكاء");
    });
  });

  // 4. اختبار التحديث
  describe("update", () => {
    it("يحدث البيانات الممررة فقط", async () => {
      const createdTask = await prisma.task.create({
        data: { ...taskData, id: "task-update-id" },
      });

      const updatedTask = await taskRepository.update(createdTask.id, {
        title: "عنوان جديد محدث",
        status: TaskStatus.DONE,
      });

      expect(updatedTask.title).toBe("عنوان جديد محدث");
      expect(updatedTask.status).toBe(TaskStatus.DONE);

      const dbTask = await prisma.task.findUnique({
        where: { id: createdTask.id },
      });
      expect(dbTask?.title).toBe("عنوان جديد محدث");
    });
  });

  // 5. اختبار الحذف
  describe("delete", () => {
    it("تحذف المهمة بنجاح", async () => {
      const createdTask = await prisma.task.create({
        data: { ...taskData, id: "task-delete-id" },
      });

      await taskRepository.delete(createdTask.id);

      const dbTask = await prisma.task.findUnique({
        where: { id: createdTask.id },
      });
      expect(dbTask).toBeNull();
    });
  });
});
