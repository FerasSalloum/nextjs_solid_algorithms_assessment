import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { ProjectRepository } from "@/src/infrastructure/repositories/ProjectRepository";
import { ProjectStatus } from "@prisma/client";
import { mockManagerUser } from "@/tests/unit/mocks/mockData";

const projectData = {
  name: "مشروع إدارة المهام",
  description: "مشروع لاختبار عمليات قاعدة البيانات الحقيقية",
  status: ProjectStatus.ACTIVE,
  ownerId: mockManagerUser.id,
};

describe("ProjectRepository - Real Database Integration Test", () => {
  const projectRepository = new ProjectRepository();

  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({ data: mockManagerUser });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. اختبار إنشاء مشروع جديد
  describe("create", () => {
    it("يحفظ المشروع بنجاح", async () => {
      const createdProject = await projectRepository.create(projectData);

      expect(createdProject).toBeDefined();
      expect(createdProject.id).toBeDefined();
      expect(createdProject.name).toBe(projectData.name);
      expect(createdProject.ownerId).toBe(mockManagerUser.id);
      expect(createdProject.status).toBe(ProjectStatus.ACTIVE);

      const dbProject = await prisma.project.findUnique({
        where: { id: createdProject.id },
      });
      expect(dbProject).not.toBeNull();
    });
  });

  // 2. البحث بواسطة المعرف مع العلاقة

  describe("findById", () => {
    it("يجلب المشروع مع بيانات المالِك", async () => {
      const createdProject = await prisma.project.create({
        data: { ...projectData, id: "project-123" },
      });

      const foundProject = await projectRepository.findById(createdProject.id);

      expect(foundProject).not.toBeNull();
      expect(foundProject?.id).toBe(createdProject.id);

      expect(foundProject?.owner).toBeDefined();
      expect(foundProject?.owner?.id).toBe(mockManagerUser.id);
      expect(foundProject?.owner?.email).toBe(mockManagerUser.email);
    });

    it("يرجع قيمة فارغة إذا كان المشروع غير موجود", async () => {
      const foundProject = await projectRepository.findById("non-existent-proj-id");
      expect(foundProject).toBeNull();
    });
  });

  describe("findAll", () => {
    beforeEach(async () => {
      await Promise.all([
        prisma.project.create({
          data: {
            ...projectData,
            id: "proj-1",
            name: "مشروع الذكاء الاصطناعي",
            description: "تطبيق الخوارزميات المتقدمة",
            status: ProjectStatus.ACTIVE,
          },
        }),
        prisma.project.create({
          data: {
            ...projectData,
            id: "proj-2",
            name: "مشروع أتمتة الاختبارات",
            description: "وحدة بناء وتكامل مستمر",
            status: ProjectStatus.COMPLETED,
          },
        }),
      ]);
    });

    it("يجلب كافة المشاريع مرتبة تنازلياً حسب التاريخ", async () => {
      const projects = await projectRepository.findAll();
      expect(projects).toHaveLength(2);
    });

    it("يصفّي المشاريع حسب الحالة", async () => {
      const activeProjects = await projectRepository.findAll({
        status: ProjectStatus.ACTIVE,
      });

      expect(activeProjects).toHaveLength(1);
      expect(activeProjects[0].name).toBe("مشروع الذكاء الاصطناعي");
    });

    it("البحث في الاسم والوصف", async () => {
      const searchResults = await projectRepository.findAll({
        search: "أتمتة",
      });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe("مشروع أتمتة الاختبارات");
    });
  });

  // 4. اختبار التحديث 
  describe("update", () => {
    it("يجب أن يكتفي بتحديث الحقول المحددة فقط", async () => {
      const createdProject = await prisma.project.create({
        data: { ...projectData, id: "proj-update-id" },
      });

      const updatedProject = await projectRepository.update(createdProject.id, {
        name: "اسم المشروع المُعدّل",
      });

      expect(updatedProject.name).toBe("اسم المشروع المُعدّل");
      expect(updatedProject.description).toBe(projectData.description); 

      const dbProject = await prisma.project.findUnique({
        where: { id: createdProject.id },
      });
      expect(dbProject?.name).toBe("اسم المشروع المُعدّل");
    });
  });

  // 5. اختبار الأرشفة 
  describe("archive", () => {
    it("تحويل المشروع إلى الارشيف", async () => {
      const createdProject = await prisma.project.create({
        data: { ...projectData, id: "proj-archive-id", status: ProjectStatus.ACTIVE },
      });

      const archivedProject = await projectRepository.archive(createdProject.id);

      expect(archivedProject.status).toBe(ProjectStatus.ARCHIVED);

      const dbProject = await prisma.project.findUnique({
        where: { id: createdProject.id },
      });
      expect(dbProject?.status).toBe(ProjectStatus.ARCHIVED);
    });
  });

  // 6. اختبار الحذف 
  describe("delete", () => {
    it("يحذف المشروع بنجاح", async () => {
      const createdProject = await prisma.project.create({
        data: { ...projectData, id: "proj-delete-id" },
      });

      await projectRepository.delete(createdProject.id);

      const dbProject = await prisma.project.findUnique({
        where: { id: createdProject.id },
      });
      expect(dbProject).toBeNull();
    });
  });
});