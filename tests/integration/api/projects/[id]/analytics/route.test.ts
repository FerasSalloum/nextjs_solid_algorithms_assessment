import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/src/app/api/projects/[id]/analytics/route";
import { ProjectAnalyticsService } from "@/src/application/services/ProjectAnalyticsService";
import { NotFoundError, ForbiddenError } from "@/src/domain/errors/AppError";

// عمل Mock لخدمة التحليلات لضمان عزل اختبار الـ API
vi.mock("@/src/application/services/ProjectAnalyticsService");

describe("API Route: GET /api/projects/[id]/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يجب أن يعيد البيانات بنجاح مع كود الحالة 200 عندما يكون المستخدم مصرحاً له", async () => {
    const mockAnalyticsData = {
      projectId: "project-123",
      projectName: "مشروع اختبار الذكاء الاصطناعي",
      totalTasks: 10,
      completedTasks: 8,
      pendingTasks: 2,
      overdueTasks: 0,
      criticalTasks: 1,
      completionRate: 80,
      overdueRate: 0,
      tasksByStatus: {
        TODO: 1,
        IN_PROGRESS: 1,
        IN_REVIEW: 0,
        DONE: 8,
        CANCELLED: 0,
      },
      tasksByPriority: { LOW: 2, MEDIUM: 5, HIGH: 2, CRITICAL: 1 },
      healthScore: "HEALTHY" as "HEALTHY" | "AT_RISK" | "CRITICAL",
    };

    // محاكاة نجاح دالة الخدمة
    vi.mocked(
      ProjectAnalyticsService.prototype.getProjectAnalytics,
    ).mockResolvedValueOnce(mockAnalyticsData);

    // إنشاء طلب وهمي (Mock Request) مع هيدرز الصلاحيات
    const request = new Request(
      "http://localhost:3000/api/projects/project-123/analytics",
      {
        method: "GET",
        headers: {
          "x-user-id": "admin-user-1",
          "x-user-role": "ADMIN",
        },
      },
    );

    // استدعاء دالة GET مع تمرير الـ params كـ Promise متوافقة مع Next.js 15
    const response = await GET(request, {
      params: Promise.resolve({ id: "project-123" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockAnalyticsData);
  });

  it("يجب أن يعيد خطأ 404 عندما يكون المشروع غير موجود", async () => {
    // محاكاة إطلاق خطأ NotFoundError من الخدمة
    vi.mocked(
      ProjectAnalyticsService.prototype.getProjectAnalytics,
    ).mockRejectedValueOnce(new NotFoundError("المشروع غير موجود"));

    const request = new Request(
      "http://localhost:3000/api/projects/non-existent/analytics",
      {
        method: "GET",
        headers: {
          "x-user-id": "admin-user-1",
          "x-user-role": "ADMIN",
        },
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "non-existent" }),
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("المشروع غير موجود");
  });

  it("يجب أن يعيد خطأ 403 عندما يفتقر المستخدم للصلاحيات المطلوبة", async () => {
    // محاكاة إطلاق خطأ ForbiddenError من الخدمة
    vi.mocked(
      ProjectAnalyticsService.prototype.getProjectAnalytics,
    ).mockRejectedValueOnce(
      new ForbiddenError("لا تملك صلاحية للاطلاع على تحليلات هذا المشروع"),
    );

    const request = new Request(
      "http://localhost:3000/api/projects/project-123/analytics",
      {
        method: "GET",
        headers: {
          "x-user-id": "member-user-2",
          "x-user-role": "MEMBER",
        },
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "project-123" }),
    });

    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("لا تملك صلاحية للاطلاع على تحليلات هذا المشروع");
  });

  it("يجب أن يعيد خطأ 500 عند حدوث استثناء غير متوقع في الخادم", async () => {
    // محاكاة خطأ غير متوقع (Database crash مثلاً)
    vi.mocked(
      ProjectAnalyticsService.prototype.getProjectAnalytics,
    ).mockRejectedValueOnce(new Error("Database connection lost"));

    const request = new Request(
      "http://localhost:3000/api/projects/project-123/analytics",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "project-123" }),
    });

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
  });
});
