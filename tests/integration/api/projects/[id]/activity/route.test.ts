import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/src/app/api/projects/[id]/activity/route";
import { ActivityLogService } from "@/src/application/services/ActivityLogService";
import { ForbiddenError } from "@/src/domain/errors/AppError";

// محاكاة طبقة الخدمة
vi.mock("@/src/application/services/ActivityLogService");

describe("API Route: GET /api/projects/[id]/activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يجب أن يعيد سجلات الأنشطة بنجاح مع كود 200 للمستخدم المصرح له (ADMIN / MANAGER)", async () => {
    const mockLogs = [
      {
        id: "log-1",
        userId: "user-1",
        action: "TASK_CREATED",
        projectId: "project-100",
        taskId: null,
        metadata: {},
        createdAt: new Date(),
        user: { id: "user-1", name: "Ahmed", email: "ahmed@example.com" },
      },
    ];

    vi.mocked(ActivityLogService.prototype.getLogs).mockResolvedValueOnce(
      mockLogs,
    );

    const request = new Request(
      "http://localhost:3000/api/projects/project-100/activity",
      {
        method: "GET",
        headers: {
          "user-role": "ADMIN",
        },
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "project-100" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    const expectedLogs = JSON.parse(JSON.stringify(mockLogs));
    expect(body.data).toEqual(expectedLogs);
    expect(ActivityLogService.prototype.getLogs).toHaveBeenCalledWith("ADMIN", {
      projectId: "project-100",
      userId: undefined,
      action: undefined,
    });
  });

  it("يجب أن يمرر معلمات الفلترة (userId و action) بشكل صحيح إلى الخدمة", async () => {
    vi.mocked(ActivityLogService.prototype.getLogs).mockResolvedValueOnce([]);

    const request = new Request(
      "http://localhost:3000/api/projects/project-100/activity?userId=user-2&action=PROJECT_UPDATED",
      {
        method: "GET",
        headers: {
          "user-role": "MANAGER",
        },
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "project-100" }),
    });

    expect(response.status).toBe(200);
    expect(ActivityLogService.prototype.getLogs).toHaveBeenCalledWith(
      "MANAGER",
      {
        projectId: "project-100",
        userId: undefined,
        action: "PROJECT_UPDATED",
      },
    );
  });

  it("يجب أن يعيد خطأ 403 عندما يحاول عضو (MEMBER) استعراض سجل الأنشطة", async () => {
    vi.mocked(ActivityLogService.prototype.getLogs).mockRejectedValueOnce(
      new ForbiddenError(
        "صلاحيات غير كافية: لا يحق للأعضاء استعراض سجل الأنشطة",
      ),
    );

    const request = new Request(
      "http://localhost:3000/api/projects/project-100/activity",
      {
        method: "GET",
        headers: {
          "x-user-role": "MEMBER",
        },
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "project-100" }),
    });

    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe(
      "صلاحيات غير كافية: لا يحق للأعضاء استعراض سجل الأنشطة",
    );
  });

  it("يجب أن يعتمد دور MEMBER كقيمة افتراضية عند غياب الهيدر x-user-role", async () => {
    vi.mocked(ActivityLogService.prototype.getLogs).mockRejectedValueOnce(
      new ForbiddenError(
        "صلاحيات غير كافية: لا يحق للأعضاء استعراض سجل الأنشطة",
      ),
    );

    const request = new Request(
      "http://localhost:3000/api/projects/project-100/activity",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "project-100" }),
    });

    expect(response.status).toBe(403);
    expect(ActivityLogService.prototype.getLogs).toHaveBeenCalledWith(
      "MEMBER",
      expect.any(Object),
    );
  });

  it("يجب أن يعيد خطأ 500 عند حدوث أخطاء استثناء غير متوقعة في الخادم", async () => {
    vi.mocked(ActivityLogService.prototype.getLogs).mockRejectedValueOnce(
      new Error("فشل الاتصال بقاعدة البيانات"),
    );

    const request = new Request(
      "http://localhost:3000/api/projects/project-100/activity",
      {
        method: "GET",
        headers: {
          "x-user-role": "ADMIN",
        },
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "project-100" }),
    });

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
  });
});
