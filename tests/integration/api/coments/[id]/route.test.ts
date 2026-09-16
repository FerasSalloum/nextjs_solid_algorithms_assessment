import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH, DELETE } from "@/src/app/api/coments/[id]/route";
import { TaskCommentService } from "@/src/application/services/TaskCommentService";
import {
  NotFoundError,
  ForbiddenError,
  AppError,
} from "@/src/domain/errors/AppError";
import {
  mockTaskComment,
  mockMemberUser,
  mockAdminUser,
} from "@/tests/unit/mocks/mockData";

// عمل Mock لخدمة التعليقات لعزل اختبار الـ API
vi.mock("@/src/application/services/TaskCommentService");

describe("API Route: /api/comments/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // اختبارات طلب PATCH (تعديل تعليق)
  // ==========================================
  describe("PATCH /api/comments/[id]", () => {
    it("يجب أن يعدل التعليق بنجاح مع كود 200 عند توفر الصلاحيات", async () => {
      const updatedContent = "محتوى التعليق المحدث";
      const updatedCommentMock = {
        ...mockTaskComment,
        content: updatedContent,
      };

      vi.mocked(
        TaskCommentService.prototype.updateComment
      ).mockResolvedValueOnce(updatedCommentMock);

      const request = new Request(
        `http://localhost:3000/api/comments/${mockTaskComment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": mockMemberUser.id,
            "x-user-role": mockMemberUser.role,
          },
          body: JSON.stringify({ content: updatedContent }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ id: mockTaskComment.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(JSON.parse(JSON.stringify(updatedCommentMock)));
    });

    it("يجب أن يعيد خطأ 403 عندما لا يملك المستخدم صلاحية تعديل التعليق", async () => {
      vi.mocked(
        TaskCommentService.prototype.updateComment
      ).mockRejectedValueOnce(
        new ForbiddenError("صلاحيات غير كافية: لا يمكنك تعديل تعليق شخص آخر")
      );

      const request = new Request(
        `http://localhost:3000/api/comments/${mockTaskComment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "other-user",
            "x-user-role": "MEMBER",
          },
          body: JSON.stringify({ content: "تعديل غير مصرح" }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ id: mockTaskComment.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe(
        "صلاحيات غير كافية: لا يمكنك تعديل تعليق شخص آخر"
      );
    });

    it("يجب أن يعيد خطأ 404 عندما يكون التعليق غير موجود", async () => {
      vi.mocked(
        TaskCommentService.prototype.updateComment
      ).mockRejectedValueOnce(new NotFoundError("التعليق غير موجود"));

      const request = new Request(
        "http://localhost:3000/api/comments/non-existent-id",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": mockAdminUser.id,
            "x-user-role": mockAdminUser.role,
          },
          body: JSON.stringify({ content: "تعديل تعليق غير موجود" }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ id: "non-existent-id" }),
      });

      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("التعليق غير موجود");
    });

    it("يجب أن يعيد خطأ 400 عند تمرير محتوى تعليق فارغ", async () => {
      vi.mocked(
        TaskCommentService.prototype.updateComment
      ).mockRejectedValueOnce(
        new AppError("محتوى التعليق لا يمكن أن يكون فارغاً", 400)
      );

      const request = new Request(
        `http://localhost:3000/api/comments/${mockTaskComment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": mockMemberUser.id,
            "x-user-role": mockMemberUser.role,
          },
          body: JSON.stringify({ content: "" }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ id: mockTaskComment.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("محتوى التعليق لا يمكن أن يكون فارغاً");
    });

    it("يجب أن يعيد خطأ 500 عند حدوث خطأ غير متوقع في الخادم", async () => {
      vi.mocked(
        TaskCommentService.prototype.updateComment
      ).mockRejectedValueOnce(new Error("Database failure"));

      const request = new Request(
        `http://localhost:3000/api/comments/${mockTaskComment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: "اختبار الخطأ" }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ id: mockTaskComment.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
    });
  });

  // ==========================================
  // اختبارات طلب DELETE (حذف تعليق)
  // ==========================================
  describe("DELETE /api/comments/[id]", () => {
    it("يجب أن يحذف التعليق بنجاح مع كود 200 عند توفر الصلاحيات", async () => {
      vi.mocked(
        TaskCommentService.prototype.deleteComment
      ).mockResolvedValueOnce(undefined);

      const request = new Request(
        `http://localhost:3000/api/comments/${mockTaskComment.id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": mockMemberUser.id,
            "x-user-role": mockMemberUser.role,
          },
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockTaskComment.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("تم حذف التعليق بنجاح");
    });

    it("يجب أن يعيد خطأ 403 عندما يحاول مستخدم غير مصرح له حذف التعليق", async () => {
      vi.mocked(
        TaskCommentService.prototype.deleteComment
      ).mockRejectedValueOnce(
        new ForbiddenError("صلاحيات غير كافية: لا يمكنك حذف هذا التعليق")
      );

      const request = new Request(
        `http://localhost:3000/api/comments/${mockTaskComment.id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": "unauthorized-user",
            "x-user-role": "MEMBER",
          },
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockTaskComment.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe("صلاحيات غير كافية: لا يمكنك حذف هذا التعليق");
    });

    it("يجب أن يعيد خطأ 404 عند محاولة حذف تعليق غير موجود", async () => {
      vi.mocked(
        TaskCommentService.prototype.deleteComment
      ).mockRejectedValueOnce(new NotFoundError("التعليق غير موجود"));

      const request = new Request(
        "http://localhost:3000/api/comments/non-existent-id",
        {
          method: "DELETE",
          headers: {
            "x-user-id": mockAdminUser.id,
            "x-user-role": mockAdminUser.role,
          },
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "non-existent-id" }),
      });

      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("التعليق غير موجود");
    });

    it("يجب أن يعيد خطأ 500 عند حدوث استثناء غير متوقع", async () => {
      vi.mocked(
        TaskCommentService.prototype.deleteComment
      ).mockRejectedValueOnce(new Error("Unexpected error"));

      const request = new Request(
        `http://localhost:3000/api/comments/${mockTaskComment.id}`,
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockTaskComment.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
    });
  });
});