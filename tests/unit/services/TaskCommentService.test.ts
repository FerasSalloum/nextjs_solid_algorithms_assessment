import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskCommentService } from "../../../src/application/services/TaskCommentService";
import { ITaskCommentRepository } from "../../../src/domain/interfaces/ITaskCommentRepository";
import { Role } from "@prisma/client";
import {
  mockAdminUser,
  mockManagerUser,
  mockMemberUser,
  mockTask,
  mockTaskComment,
  mockTaskCommentWithAuthor,
  mockTaskCommentWithTask,
} from "@tests/unit/mocks/mockData";

describe("TaskCommentService_Unit_Tests", () => {
  let commentRepository: ITaskCommentRepository;
  let commentService: TaskCommentService;

  beforeEach(() => {
    commentRepository = {
      findById: vi.fn(),
      findByTaskId: vi.fn(),
      findByAuthorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    commentService = new TaskCommentService(commentRepository);
    vi.clearAllMocks();
  });

//   اختبار الدالة الاولى جلب التعليق بستخدام معرف المهمة مع معلومات الكاتب
  describe("getCommentsByTaskId", () => {
    it("جلب التعليقا ت الخاصة بمهمة محددة مع معلومات الكاتب", async () => {
      vi.mocked(commentRepository.findByTaskId).mockResolvedValue([
        mockTaskCommentWithAuthor,
      ]);

      const result = await commentService.getCommentsByTaskId(mockTask.id);

      expect(commentRepository.findByTaskId).toHaveBeenCalledWith(mockTask.id);
      expect(result).toEqual([mockTaskCommentWithAuthor]);
    });
  });

//   اختبار الدالة الثانية جلب التعليق بستخدام معرف الكاتب مع معلومات المهمة
  describe("getCommentsByAuthorId", () => {
    it("جلب التعليقا ت الخاصة بمستخدم محددة مع معلومات المهمة", async () => {
      vi.mocked(commentRepository.findByAuthorId).mockResolvedValue([
        mockTaskCommentWithTask,
      ]);

      const result = await commentService.findByAuthorId(mockMemberUser.id);

      expect(commentRepository.findByAuthorId).toHaveBeenCalledWith(mockMemberUser.id);
      expect(result).toEqual([mockTaskCommentWithTask]);
    });
  });

  
//   اختبار الدالة الثالثة انشاء تعليق
  
  describe("createComment", () => {
    it("انشاء تعليق جديد", async () => {
      const createInput = {
        taskId: mockTask.id,
        authorId: mockMemberUser.id,
        content: "تعليق عام",
      };

      vi.mocked(commentRepository.create).mockResolvedValue(mockTaskComment);

      const result = await commentService.createComment(createInput);

      expect(commentRepository.create).toHaveBeenCalledWith(createInput);
      expect(result).toEqual(mockTaskComment);
    });

    it("خطاء التعليق فارغ او فقط مسافات ", async () => {
      await expect(
        commentService.createComment({
          taskId: mockTask.id,
          authorId: mockMemberUser.id,
          content: "    ",
        })
      ).rejects.toThrow("محتوى التعليق لا يمكن أن يكون فارغاً");

      expect(commentRepository.create).not.toHaveBeenCalled();
    });
  });
//   اختبار الدالة الرابعة التعديل على التعليق 
  describe("updateComment", () => {
    it("خطاء تعليق غير موجود", async () => {
      vi.mocked(commentRepository.findById).mockResolvedValue(null);

      await expect(
        commentService.updateComment(
          mockAdminUser.id,
          Role.ADMIN,
          "non-existent-id",
          "محتوى جديد"
        )
      ).rejects.toThrow("التعليق غير موجود");

      expect(commentRepository.update).not.toHaveBeenCalled();
    });

    it("خطاء نص التعليق فارغ", async () => {
      vi.mocked(commentRepository.findById).mockResolvedValue(
        mockTaskCommentWithAuthor
      );

      await expect(
        commentService.updateComment(
          mockMemberUser.id,
          Role.MEMBER,
          mockTaskComment.id,
          "   "
        )
      ).rejects.toThrow("محتوى التعليق لا يمكن أن يكون فارغاً");

      expect(commentRepository.update).not.toHaveBeenCalled();
    });

    it("يسمح للمشرف بتعديل اي تعليق", async () => {
      const updatedComment = { ...mockTaskComment, content: "تعديل مشرف" };

      vi.mocked(commentRepository.findById).mockResolvedValue(
        mockTaskCommentWithAuthor
      );
      vi.mocked(commentRepository.update).mockResolvedValue(updatedComment);

      const result = await commentService.updateComment(
        mockAdminUser.id,
        Role.ADMIN,
        mockTaskComment.id,
        "تعديل مشرف"
      );

      expect(commentRepository.update).toHaveBeenCalledWith(
        mockTaskComment.id,
        "تعديل مشرف"
      );
      expect(result.content).toBe("تعديل مشرف");
    });

    it("يسمح للكاتب بتعديل التعليقات الخاصة بة", async () => {
      vi.mocked(commentRepository.findById).mockResolvedValue(
        mockTaskCommentWithAuthor
      );
      vi.mocked(commentRepository.update).mockResolvedValue({
        ...mockTaskComment,
        content: "تعديل بواسطة الكاتب",
      });

      await commentService.updateComment(
        mockMemberUser.id, 
        Role.MEMBER,
        mockTaskComment.id,
        "تعديل بواسطة الكاتب"
      );

      expect(commentRepository.update).toHaveBeenCalledWith(
        mockTaskComment.id,
        "تعديل بواسطة الكاتب"
      );
    });

    it("لا يسمح للاعضاء بتغير تعليقات الاعضاء المستخدمين الاخرين", async () => {
      vi.mocked(commentRepository.findById).mockResolvedValue(
        mockTaskCommentWithAuthor
      );

      await expect(
        commentService.updateComment(
          "other-member-id",
          Role.MEMBER,
          mockTaskComment.id,
          "محاولة تعديل"
        )
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك تعديل تعليق شخاص آخر");

      expect(commentRepository.update).not.toHaveBeenCalled();
    });
  });
// اختبار الدالة الخامسة حذف تعليق
  describe("deleteComment", () => {
    it("يجب أن يرمي خطأ إذا كان التعليق المراد حذفه غير موجود", async () => {
      vi.mocked(commentRepository.findById).mockResolvedValue(null);

      await expect(
        commentService.deleteComment(
          mockAdminUser.id,
          Role.ADMIN,
          "non-existent-id"
        )
      ).rejects.toThrow("التعليق غير موجود");

      expect(commentRepository.delete).not.toHaveBeenCalled();
    });

    it("يجب أن يسمح للمدير (MANAGER) والمشرف (ADMIN) بحذف التعليق", async () => {
      vi.mocked(commentRepository.findById).mockResolvedValue(
        mockTaskCommentWithAuthor
      );
      vi.mocked(commentRepository.delete).mockResolvedValue();

      await commentService.deleteComment(
        mockManagerUser.id,
        Role.MANAGER,
        mockTaskComment.id
      );

      expect(commentRepository.delete).toHaveBeenCalledWith(mockTaskComment.id);
    });

    it("يجب أن يمنع العضو (MEMBER) من حذف التعليق وفقاً لقواعد المنطق البرمجي", async () => {
      vi.mocked(commentRepository.findById).mockResolvedValue(
        mockTaskCommentWithAuthor
      );

      await expect(
        commentService.deleteComment(
          mockMemberUser.id,
          Role.MEMBER,
          mockTaskComment.id
        )
      ).rejects.toThrow("صلاحيات غير كافية: لا يمكنك حذف هذا التعليق");

      expect(commentRepository.delete).not.toHaveBeenCalled();
    });
  });
});