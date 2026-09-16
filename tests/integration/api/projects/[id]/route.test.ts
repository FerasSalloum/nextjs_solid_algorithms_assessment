import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PATCH, DELETE } from "@/src/app/api/projects/[id]/route";
import { NextRequest } from "next/server";
import { ProjectService } from "@/src/application/services/ProjectService";
import { NotFoundError} from "@/src/domain/errors/AppError";
import { Role, ProjectStatus } from "@prisma/client";

vi.mock("@/src/application/services/ProjectService");

describe("GET, PATCH & DELETE /api/projects/[id] Route Handler Integration Tests", () => {
  const mockParams = Promise.resolve({ id: "project-123" });

  // إضافة كائن owner الكامل لتطابق أنواع Prisma العائدة من الخدمة
  const mockProjectFromDb = {
    id: "project-123",
    name: "مشروع إدارة المهام",
    description: "وصف المشروع الاختباري",
    status: ProjectStatus.ACTIVE,
    ownerId: "manager-123",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    owner: {
      id: "manager-123",
      name: "مدير النظام",
      email: "manager@example.com",
      passwordHash: "hashed-password",
      role: Role.MANAGER,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/projects/[id]", () => {
    it("يرجع status 200 وتفاصيل المشروع بنجاح", async () => {
      vi.mocked(ProjectService.prototype.getProjectById).mockResolvedValue(
        mockProjectFromDb,
      );

      const req = new NextRequest(
        "http://localhost:3000/api/projects/project-123",
      );
      const res = await GET(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        ...mockProjectFromDb,
        createdAt: mockProjectFromDb.createdAt.toISOString(),
        updatedAt: mockProjectFromDb.updatedAt.toISOString(),
        owner: {
          ...mockProjectFromDb.owner,
          createdAt: mockProjectFromDb.owner.createdAt.toISOString(),
          updatedAt: mockProjectFromDb.owner.updatedAt.toISOString(),
        },
      });
    });

    it("يرجع status 404 عند عدم وجود المشروع", async () => {
      vi.mocked(ProjectService.prototype.getProjectById).mockRejectedValue(
        new NotFoundError("المشروع غير موجود"),
      );

      const req = new NextRequest(
        "http://localhost:3000/api/projects/invalid-id",
      );
      const res = await GET(req, {
        params: Promise.resolve({ id: "invalid-id" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe("المشروع غير موجود");
    });
  });

  describe("PATCH /api/projects/[id]", () => {
    it("يرجع status 200 ويقوم بتحديث البيانات بنجاح", async () => {
      const updatedProjectFromDb = {
        ...mockProjectFromDb,
        name: "تحديث اسم المشروع",
        status: ProjectStatus.COMPLETED,
      };

      vi.mocked(ProjectService.prototype.updateProject).mockResolvedValue(
        updatedProjectFromDb,
      );

      const req = new NextRequest(
        "http://localhost:3000/api/projects/project-123",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "manager-123",
            "x-user-role": Role.MANAGER,
          },
          body: JSON.stringify({
            name: "تحديث اسم المشروع",
            status: "COMPLETED",
          }),
        },
      );

      const res = await PATCH(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe("تحديث اسم المشروع");
      expect(data.status).toBe("COMPLETED");
    });
  });

  describe("DELETE /api/projects/[id]", () => {
    it("يرجع status 200 ويقوم بحذف المشروع بنجاح", async () => {
      // إرجاع undefined ليتم التوافق مع Promise<void>
      vi.mocked(ProjectService.prototype.deleteProject).mockResolvedValue(
        undefined,
      );

      const req = new NextRequest(
        "http://localhost:3000/api/projects/project-123",
        {
          method: "DELETE",
          headers: {
            "x-user-id": "manager-123",
            "x-user-role": Role.ADMIN,
          },
        },
      );

      const res = await DELETE(req, { params: mockParams });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe("تم حذف المشروع بنجاح");
    });
  });
});
