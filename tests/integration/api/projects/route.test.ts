import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "@/src/app/api/projects/route";
import { NextRequest } from "next/server";
import { ProjectService } from "@/src/application/services/ProjectService";
import { ForbiddenError } from "@/src/domain/errors/AppError";
import { Role, ProjectStatus } from "@prisma/client";

// محاكاة طبقة ProjectService
vi.mock("@/src/application/services/ProjectService");

describe("GET & POST /api/projects Route Handler Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/projects", () => {
    it("يرجع status 200 وقائمة المشاريع بنجاح", async () => {
      const mockProjectFromDb = {
        id: "project-123",
        name: "مشروع تطوير النظام",
        description: "وصف المشروع الاختباري",
        status: ProjectStatus.ACTIVE,
        ownerId: "manager-123",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };

      vi.mocked(ProjectService.prototype.getProjects).mockResolvedValue([
        mockProjectFromDb,
      ]);

      const req = new NextRequest(
        "http://localhost:3000/api/projects?status=ACTIVE",
      );
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      // تحويل Date إلى String للمطابقة الدقيقة بعد Serialization
      expect(data).toEqual([
        {
          ...mockProjectFromDb,
          createdAt: mockProjectFromDb.createdAt.toISOString(),
          updatedAt: mockProjectFromDb.updatedAt.toISOString(),
        },
      ]);
    });
  });

  describe("POST /api/projects", () => {
    it("يرجع status 201 ويُنشئ مشروع جديد بنجاح", async () => {
      const createdProjectFromDb = {
        id: "project-123",
        name: "مشروع تطوير النظام",
        description: "وصف المشروع الاختباري",
        status: ProjectStatus.ACTIVE,
        ownerId: "manager-123",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };

      vi.mocked(ProjectService.prototype.createProject).mockResolvedValue(
        createdProjectFromDb,
      );

      const req = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "manager-123",
          "x-user-role": Role.ADMIN,
        },
        body: JSON.stringify({
          name: "مشروع تطوير النظام",
          description: "وصف المشروع الاختباري",
          status: "ACTIVE",
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      // تحويل Date إلى String للمطابقة مع استجابة res.json()
      expect(data).toEqual({
        ...createdProjectFromDb,
        createdAt: createdProjectFromDb.createdAt.toISOString(),
        updatedAt: createdProjectFromDb.updatedAt.toISOString(),
      });
    });

    it("يرجع status 400 عند فشل التحقق من صحة المدخلات عبر Zod (اسم أطول من 50 حرف)", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "أ".repeat(51),
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("بيانات الإدخال غير صالحة");
      expect(data.details).toHaveProperty("name");
    });

    it("يرجع status 403 عند محاولة MEMBER إنشاء مشروع", async () => {
      vi.mocked(ProjectService.prototype.createProject).mockRejectedValue(
        new ForbiddenError(
          "صلاحيات غير كافية: لا يحق للأعضاء إنشاء مشاريع جديدة",
        ),
      );

      const req = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-member-id",
          "x-user-role": Role.MEMBER,
        },
        body: JSON.stringify({
          name: "مشروع عضو",
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe(
        "صلاحيات غير كافية: لا يحق للأعضاء إنشاء مشاريع جديدة",
      );
    });
  });
});
