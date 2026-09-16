import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PATCH, DELETE } from "@/src/app/api/tasks/[id]/route";
import { NextRequest } from "next/server";
import { TaskService } from "@/src/application/services/TaskService";
import { NotFoundError, ForbiddenError } from "@/src/domain/errors/AppError";
import { Role, TaskStatus } from "@prisma/client";
import { mockTaskWithAssigneeProjectOwner } from "@/tests/unit/mocks/mockData";

// محاكاة طبقة TaskService
vi.mock("@/src/application/services/TaskService");

describe("API Route: /api/tasks/[id] Integration Tests", () => {
  const validTaskId = "task-123e4567-e89b-12d3-a456-426614174000";
  const mockParams = Promise.resolve({ id: validTaskId });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------
  // اختبارات مسار GET
  // ---------------------------------------------------------
  describe("GET /api/tasks/[id]", () => {
    it("يرجع status 200 وبيانات المهمة بنجاح مع تحويل التواريخ", async () => {
      vi.mocked(TaskService.prototype.getTaskById).mockResolvedValue(
        mockTaskWithAssigneeProjectOwner,
      );

      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
      );
      const res = await GET(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(200);
      const expectedData = JSON.parse(
        JSON.stringify(mockTaskWithAssigneeProjectOwner),
      );
      expect(data).toEqual(expectedData);
      expect(TaskService.prototype.getTaskById).toHaveBeenCalledWith(
        validTaskId,
      );
    });

    it("يرجع status 404 عند إرجاع NotFoundError إذا لم تكن المهمة موجودة", async () => {
      vi.mocked(TaskService.prototype.getTaskById).mockRejectedValue(
        new NotFoundError("المهمة غير موجودة"),
      );

      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
      );
      const res = await GET(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe("المهمة غير موجودة");
    });
  });

  // ---------------------------------------------------------
  // اختبارات مسار PATCH
  // ---------------------------------------------------------
  describe("PATCH /api/tasks/[id]", () => {
    it("يرجع status 200 ويحدث المهمة بنجاح عند توفر الصلاحية", async () => {
      const updatedTask = {
        ...mockTaskWithAssigneeProjectOwner,
        status: TaskStatus.IN_PROGRESS,
      };
      vi.mocked(TaskService.prototype.updateTask).mockResolvedValue(
        updatedTask,
      );

      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "user-id": "admin-123",
            "user-role": Role.ADMIN,
          },
          body: JSON.stringify({ status: "IN_PROGRESS" }),
        },
      );

      const res = await PATCH(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(200);
      const expectedData = JSON.parse(JSON.stringify(updatedTask));
      expect(data).toEqual(expectedData);

      expect(TaskService.prototype.updateTask).toHaveBeenCalledWith(
        "admin-123",
        Role.ADMIN,
        validTaskId,
        expect.objectContaining({ status: "IN_PROGRESS" }),
      );
    });

    it("يرجع status 400 عندما يكون الـ JSON فارغاً أو غير صالح", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: "invalid-json",
        },
      );

      const res = await PATCH(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("جسم الطلب فارغ أو غير صالحة صيغة JSON");
    });

    it("يرجع status 400 عند فشل التحقق بـ Zod (تمرير حالة مهمة غير صالحة)", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "INVALID_STATUS" }),
        },
      );

      const res = await PATCH(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("بيانات الإدخال غير صالحة");
      expect(data.details).toHaveProperty("status");
    });

    it("يرجع status 403 عند إرجاع ForbiddenError (صلاحيات غير كافية)", async () => {
      vi.mocked(TaskService.prototype.updateTask).mockRejectedValue(
        new ForbiddenError("لا تملك صلاحية لتحديث هذه المهمة"),
      );

      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "user-id": "member-123",
            "user-role": Role.MEMBER,
          },
          body: JSON.stringify({ title: "عنوان جديد" }),
        },
      );

      const res = await PATCH(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("لا تملك صلاحية لتحديث هذه المهمة");
    });
  });

  // ---------------------------------------------------------
  // اختبارات مسار DELETE
  // ---------------------------------------------------------
  describe("DELETE /api/tasks/[id]", () => {
    it("يرجع status 200 ويحذف المهمة بنجاح إذا كانت الصلاحيات كافية", async () => {
      vi.mocked(TaskService.prototype.deleteTask).mockResolvedValue(undefined);

      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
        {
          method: "DELETE",
          headers: {
            "user-id": "admin-123",
            "user-role": Role.ADMIN,
          },
        },
      );

      const res = await DELETE(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe("تم حذف المهمة بنجاح");
      expect(TaskService.prototype.deleteTask).toHaveBeenCalledWith(
        "admin-123",
        Role.ADMIN,
        validTaskId,
      );
    });

    it("يرجع status 403 عند محاولة مستخدم بدون صلاحية حذف المهمة", async () => {
      vi.mocked(TaskService.prototype.deleteTask).mockRejectedValue(
        new ForbiddenError("صلاحيات غير كافية: فقط المدراء يمكنهم الحذف"),
      );

      const req = new NextRequest(
        `http://localhost:3000/api/tasks/${validTaskId}`,
        {
          method: "DELETE",
          headers: {
            "user-id": "member-123",
            "user-role": Role.MEMBER,
          },
        },
      );

      const res = await DELETE(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("صلاحيات غير كافية: فقط المدراء يمكنهم الحذف");
    });
  });
});
