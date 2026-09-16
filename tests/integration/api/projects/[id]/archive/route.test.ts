import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "@/src/app/api/projects/[id]/archive/route";
import { ProjectService } from "@/src/application/services/ProjectService";
import { NotFoundError, ForbiddenError } from "@/src/domain/errors/AppError";
import {
  mockProject,
  mockManagerUser,
  mockAdminUser,
  mockMemberUser,
} from "@/tests/unit/mocks/mockData";
import { ProjectStatus } from "@prisma/client";

vi.mock("@/src/application/services/ProjectService");

describe("API Route: PATCH /api/projects/[id]/archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يجب أن تؤرشف الخدمة المشروع بنجاح مع كود 200 عند توفر الصلاحيات الكافية", async () => {
    const archivedProjectMock = {
      ...mockProject,
      status: ProjectStatus.ARCHIVED,
    };

    vi.mocked(ProjectService.prototype.archiveProject).mockResolvedValueOnce(
      archivedProjectMock,
    );

    const request = new Request(
      `http://localhost:3000/api/projects/${mockProject.id}/archive`,
      {
        method: "PATCH",
        headers: {
          "x-user-id": mockManagerUser.id,
          "x-user-role": mockManagerUser.role,
        },
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: mockProject.id }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(JSON.parse(JSON.stringify(archivedProjectMock)));
  });

  it("يجب أن يعيد خطأ 403 عندما يحاول مستخدم غير مصرح له (MEMBER) أرشفة المشروع", async () => {
    vi.mocked(ProjectService.prototype.archiveProject).mockRejectedValueOnce(
      new ForbiddenError("صلاحيات غير كافية: لا يمكنك أرشفة هذا المشروع"),
    );

    const request = new Request(
      `http://localhost:3000/api/projects/${mockProject.id}/archive`,
      {
        method: "PATCH",
        headers: {
          "x-user-id": mockMemberUser.id,
          "x-user-role": mockMemberUser.role,
        },
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: mockProject.id }),
    });

    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("صلاحيات غير كافية: لا يمكنك أرشفة هذا المشروع");
  });

  it("يجب أن يعيد خطأ 404 عندما يكون المشروع غير موجود في قاعدة البيانات", async () => {
    vi.mocked(ProjectService.prototype.archiveProject).mockRejectedValueOnce(
      new NotFoundError("المشروع غير موجود"),
    );

    const request = new Request(
      "http://localhost:3000/api/projects/non-existent-id/archive",
      {
        method: "PATCH",
        headers: {
          "x-user-id": mockAdminUser.id,
          "x-user-role": mockAdminUser.role,
        },
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "non-existent-id" }),
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("المشروع غير موجود");
  });

  it("يجب أن يعيد خطأ 500 عند حدوث استثناء غير متوقع في الخادم", async () => {
    vi.mocked(ProjectService.prototype.archiveProject).mockRejectedValueOnce(
      new Error("Database error"),
    );

    const request = new Request(
      `http://localhost:3000/api/projects/${mockProject.id}/archive`,
      {
        method: "PATCH",
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id: mockProject.id }),
    });

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("حدث خطأ في الخادم أثناء معالجة الطلب");
  });
});
