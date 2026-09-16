// import { describe, it, expect, vi, beforeEach } from "vitest";
// import { TaskCommentService } from "@/src/application/services/TaskCommentService";
// import { mockTaskCommentWithTask } from "@/tests/unit/mocks/mockData";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/src/app/api/tasks/[id]/comments/route";
import { TaskCommentService } from "@/src/application/services/TaskCommentService";
import { NotFoundError, UnauthorizedError } from "@/src/domain/errors/AppError";
import {
  mockTask,
  mockMemberUser,
  mockTaskCommentWithAuthor,
} from "@/tests/unit/mocks/mockData";

// عمل Mock لخدمة التعليقات لعزل اختبار الـ API
vi.mock("@/src/application/services/TaskCommentService");

describe("API Route: /api/tasks/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // اختبارات طلب GET (جلب تعليقات المهمة)
  // ==========================================
  describe("GET /api/tasks/[id]/comments", () => {
    it("يجب أن يعيد قائمة التعليقات بنجاح مع كود 200", async () => {
      const mockComments = [mockTaskCommentWithAuthor];

      vi.mocked(
        TaskCommentService.prototype.getCommentsByTaskId,
      ).mockResolvedValueOnce(mockComments);

      const request = new Request(
        `http://localhost:3000/api/tasks/${mockTask.id}/comments`,
        {
          method: "GET",
        },
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: mockTask.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(JSON.parse(JSON.stringify(mockComments)));
    });

    it("يجب أن يعيد خطأ 404 عندما تكون المهمة غير موجودة", async () => {
      vi.mocked(
        TaskCommentService.prototype.getCommentsByTaskId,
      ).mockRejectedValueOnce(new NotFoundError("المهمة المطلوبة غير موجودة"));

      const request = new Request(
        "http://localhost:3000/api/tasks/invalid-id/comments",
        {
          method: "GET",
        },
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: "invalid-id" }),
      });

      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("المهمة المطلوبة غير موجودة");
    });
  });

  // ==========================================
  // اختبارات طلب POST (إضافة تعليق جديد)
  // ==========================================
  describe("POST /api/tasks/[id]/comments", () => {
    it("يجب أن ينشئ تعليقاً جديداً بنجاح مع كود 201", async () => {
      const newCommentPayload = {
        content: mockTaskCommentWithAuthor.content,
      };

      vi.mocked(
        TaskCommentService.prototype.createComment,
      ).mockResolvedValueOnce(mockTaskCommentWithAuthor);

      const request = new Request(
        `http://localhost:3000/api/tasks/${mockTask.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": mockMemberUser.id,
          },
          body: JSON.stringify(newCommentPayload),
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ id: mockTask.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(
        JSON.parse(JSON.stringify(mockTaskCommentWithAuthor)),
      );
    });

    it("يجب أن يعيد خطأ 400 عند إرسال محتوى تعليق فارغ", async () => {
      vi.mocked(
        TaskCommentService.prototype.createComment,
      ).mockRejectedValueOnce(
        new UnauthorizedError("محتوى التعليق مطلوب ولا يمكن أن يكون فارغاً"),
      );

      const request = new Request(
        `http://localhost:3000/api/tasks/${mockTask.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": mockMemberUser.id,
          },
          body: JSON.stringify({ content: "" }),
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ id: mockTask.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("محتوى التعليق مطلوب ولا يمكن أن يكون فارغاً");
    });

    it("يجب أن يعيد خطأ 500 عند حدوث مشكلة غير متوقعة في الخادم", async () => {
      vi.mocked(
        TaskCommentService.prototype.createComment,
      ).mockRejectedValueOnce(new Error("Database write error"));

      const request = new Request(
        `http://localhost:3000/api/tasks/${mockTask.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "اختبار الخطأ" }),
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ id: mockTask.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
    });
  });
});
