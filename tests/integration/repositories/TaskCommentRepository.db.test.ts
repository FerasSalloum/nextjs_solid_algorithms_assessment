import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { TaskCommentRepository } from "@/src/infrastructure/repositories/TaskCommentRepository";
import {
  mockManagerUser,
  mockMemberUser,
  mockProject,
  mockTask,
} from "@/tests/unit/mocks/mockData";

const commentInput = {
  taskId: mockTask.id,
  authorId: mockMemberUser.id,
  content: "هذا تعليق اختباري جديد على المهمة",
};

describe("TaskCommentRepository - Real Database Integration Test", () => {
  const commentRepository = new TaskCommentRepository();

  beforeEach(async () => {
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

  // 1. اختبار إنشاء تعليق 
  describe("create", () => {
    it("يحفظ التعليق بنجاح ", async () => {
      const createdComment = await commentRepository.create(commentInput);

      expect(createdComment).toBeDefined();
      expect(createdComment.id).toBeDefined();
      expect(createdComment.content).toBe(commentInput.content);
      expect(createdComment.taskId).toBe(mockTask.id);
      expect(createdComment.authorId).toBe(mockMemberUser.id);

      const dbComment = await prisma.taskComment.findUnique({
        where: { id: createdComment.id },
      });
      expect(dbComment).not.toBeNull();
    });
  });

  describe("findById", () => {
    it("يجلب التعليق الكاتب", async () => {
      const createdComment = await prisma.taskComment.create({
        data: {
          ...commentInput,
          id: "comment-123",
          content: "تعليق لاختبار الجلب بواسطة ID",
        },
      });

      const foundComment = await commentRepository.findById(createdComment.id);

      expect(foundComment).not.toBeNull();
      expect(foundComment?.id).toBe(createdComment.id);

      expect(foundComment?.author).toBeDefined();
      expect(foundComment?.author?.id).toBe(mockMemberUser.id);
      expect(foundComment?.author?.email).toBe(mockMemberUser.email);
    });

    it("يرجع قيمة فارغة إذا كان التعليق غير موجود", async () => {
      const foundComment = await commentRepository.findById(
        "non-existent-comment-id",
      );
      expect(foundComment).toBeNull();
    });
  });

  // 3. اختبار جلب تعليقات مهمة معينة 
  describe("findByTaskId", () => {
    it("يرجع كافة تعليقات المهمة مرتبة مع الكاتب", async () => {
      await Promise.all([
        prisma.taskComment.create({
          data: {
            ...commentInput,
            id: "comment-1",
            content: "التعليق الأول",
            createdAt: new Date("2026-01-01"),
          },
        }),
        prisma.taskComment.create({
          data: {
            ...commentInput,
            id: "comment-2",
            content: "التعليق الثاني ",
            createdAt: new Date("2026-01-02"),
          },
        }),
      ]);

      const comments = await commentRepository.findByTaskId(mockTask.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe("comment-2");
      expect(comments[1].id).toBe("comment-1");

      expect(
        comments.every((com) => com.author?.id === mockMemberUser.id),
      ).toBe(true);
    });

    it("يرجع مصفوفة فارغة إذا لم تكن هناك تعليقات للمهمة", async () => {
      const comments = await commentRepository.findByTaskId("empty-task-id");
      expect(comments).toEqual([]);
    });
  });

  // 4. اختبار جلب تعليقات كاتب
  describe("findByAuthorId", () => {
    it("يرجع كافة تعليقات الكاتب مع المهمة ", async () => {
      await prisma.taskComment.create({
        data: {
          ...commentInput,
          id: "comment-author-1",
          authorId: mockManagerUser.id,
          content: "تعليق المدير الأول",
        },
      });

      const comments = await commentRepository.findByAuthorId(
        mockManagerUser.id,
      );

      expect(comments).toHaveLength(1);
      expect(comments[0].authorId).toBe(mockManagerUser.id);

      // التحقق من تضمين بيانات المهمة المربوطة
      expect(comments[0].task).toBeDefined();
      expect(comments[0].task?.id).toBe(mockTask.id);
      expect(comments[0].task?.title).toBe(mockTask.title);
    });
  });

  // 5. اختبار التحديث 

  describe("update", () => {
    it(" يكتفي بتحديث نص التعليق", async () => {
      const createdComment = await prisma.taskComment.create({
        data: {
          ...commentInput,
          id: "comment-update-id",
          content: "النص القديم للتعليق",
        },
      });

      const updatedComment = await commentRepository.update(
        createdComment.id,
        "النص الجديد المُعدّل",
      );

      expect(updatedComment.content).toBe("النص الجديد المُعدّل");

      const dbComment = await prisma.taskComment.findUnique({
        where: { id: createdComment.id },
      });
      expect(dbComment?.content).toBe("النص الجديد المُعدّل");
    });
  });

  // 6. اختبار الحذف
  describe("delete", () => {
    it("يحذف التعليق بنجاح", async () => {
      const createdComment = await prisma.taskComment.create({
        data: {
          ...commentInput,
          id: "comment-delete-id",
          content: "تعليق سيتم حذفه",
        },
      });

      await commentRepository.delete(createdComment.id);

      const dbComment = await prisma.taskComment.findUnique({
        where: { id: createdComment.id },
      });
      expect(dbComment).toBeNull();
    });
  });
});
