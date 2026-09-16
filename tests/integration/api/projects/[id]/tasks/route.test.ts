import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "@/src/app/api/projects/[id]/tasks/route";
import { NextRequest } from "next/server";
import { TaskService } from "@/src/application/services/TaskService";
import { ForbiddenError } from "@/src/domain/errors/AppError";
import { Role, TaskStatus, Priority } from "@prisma/client";

// محاكاة طبقة TaskService
vi.mock("@/src/application/services/TaskService");

describe("GET & POST /api/projects/[id]/tasks Integration Tests", () => {
  const validProjectId = "123e4567-e89b-12d3-a456-426614174000";
  const validAssigneeId = "987e6543-e89b-12d3-a456-426614174000";
  const mockParams = Promise.resolve({ id: validProjectId });

  // كائن المهمة المحاكي القادم من قاعدة البيانات
  const mockTaskFromDb = {
    id: "task-100",
    title: "مهمة اختبار النواة",
    description: "وصف مفصل للمهمة الاختيارية",
    projectId: validProjectId,
    assigneeId: validAssigneeId,
    ownerId: "user-owner-123",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    dueDate: new Date("2026-10-01T00:00:00.000Z"),
    estimatedHours: 8,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/projects/[id]/tasks", () => {
    it("يرجع status 200 وقائمة المهام المفلترة بنجاح مع تحويل التواريخ إلى ISO Strings", async () => {
      vi.mocked(TaskService.prototype.getTasks).mockResolvedValue([
        mockTaskFromDb,
      ]);

      const req = new NextRequest(
        `http://localhost:3000/api/projects/${validProjectId}/tasks?status=TODO&priority=HIGH`,
      );

      const res = await GET(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual([
        {
          ...mockTaskFromDb,
          dueDate: mockTaskFromDb.dueDate.toISOString(),
          createdAt: mockTaskFromDb.createdAt.toISOString(),
          updatedAt: mockTaskFromDb.updatedAt.toISOString(),
        },
      ]);

      // التأكد من تمرير الفلاتر بشكل صحيح للخدمة
      expect(TaskService.prototype.getTasks).toHaveBeenCalledWith({
        projectId: validProjectId,
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        assigneeId: undefined,
        search: undefined,
      });
    });
  });

  describe("POST /api/projects/[id]/tasks", () => {
    it("يرجع status 201 ويُنشئ المهمة بنجاح عند توفر الصلاحية من الهيدرز", async () => {
      vi.mocked(TaskService.prototype.createTask).mockResolvedValue(
        mockTaskFromDb,
      );

      const req = new NextRequest(
        `http://localhost:3000/api/projects/${validProjectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": "user-owner-123",
            "user-role": Role.MANAGER,
          },
          body: JSON.stringify({
            title: "مهمة اختبار النواة",
            description: "وصف مفصل للمهمة الاختيارية",
            assigneeId: validAssigneeId,
            status: "TODO",
            priority: "HIGH",
            dueDate: "2026-10-01T00:00:00.000Z",
            estimatedHours: 8,
          }),
        },
      );

      const res = await POST(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toEqual({
        ...mockTaskFromDb,
        dueDate: mockTaskFromDb.dueDate.toISOString(),
        createdAt: mockTaskFromDb.createdAt.toISOString(),
        updatedAt: mockTaskFromDb.updatedAt.toISOString(),
      });

      // التحقق من أن الخدمة استلمت بيانات المنفذ من الهيدرز مع البيانات المفلترة بـ Zod
      expect(TaskService.prototype.createTask).toHaveBeenCalledWith(
        Role.MANAGER,
        {
          title: "مهمة اختبار النواة",
          description: "وصف مفصل للمهمة الاختيارية",
          projectId: validProjectId,
          assigneeId: validAssigneeId,
          ownerId: "user-owner-123",
          status: TaskStatus.TODO,
          priority: Priority.HIGH,
          dueDate: new Date("2026-10-01T00:00:00.000Z"),
          estimatedHours: 8,
        },
      );
    });

    it("يرجع status 400 عندما يكون JSON الجسم فارغاً أو غير صالح", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/projects/${validProjectId}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "invalid-json",
        },
      );

      const res = await POST(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("جسم الطلب فارغ أو غير صالحة صيغة JSON");
    });

    it("يرجع status 400 عند فشل التحقق بـ Zod (تمرير UUID غير صالح للمشروع)", async () => {
      const invalidParams = Promise.resolve({ id: "invalid-uuid-format" });

      const req = new NextRequest(
        `http://localhost:3000/api/projects/invalid-uuid-format/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "عنوان مهمة صالح",
          }),
        },
      );

      const res = await POST(req, { params: invalidParams });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("بيانات الإدخال غير صالحة");
      expect(data.details).toHaveProperty("projectId");
    });

    it("يرجع status 403 عند إرجاع ForbiddenError من طبقة الخدمة (مثل محاولة MEMBER للإنشاء)", async () => {
      vi.mocked(TaskService.prototype.createTask).mockRejectedValue(
        new ForbiddenError("صلاحيات غير كافية: لا يمكنك إنشاء المهام"),
      );

      const req = new NextRequest(
        `http://localhost:3000/api/projects/${validProjectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "user-member-id",
            "x-user-role": Role.MEMBER,
          },
          body: JSON.stringify({
            title: "مهمة بواسطة عضو",
          }),
        },
      );

      const res = await POST(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("صلاحيات غير كافية: لا يمكنك إنشاء المهام");
    });
  });
});
