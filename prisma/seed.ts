// ⚠️ يجب أن يكون dotenv/config في أول سطر لضمان قراءة ملف .env أولاً
import "dotenv/config";
import { prisma } from "../src/infrastructure/database/prisma";
import { Role, TaskStatus, Priority, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Array enums Prisma fayyadamaniin mijaahan
const taskStatuses: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
  TaskStatus.CANCELLED,
];

const taskPriorities: Priority[] = [
  Priority.LOW,
  Priority.MEDIUM,
  Priority.HIGH,
  Priority.CRITICAL,
];

async function main() {
  console.log("🧹 جاري مسح البيانات القديمة...");

  // 1. مسح البيانات بالترتيب لتجنب أخطاء القيود الخارجية (Foreign Key Constraints)
  await prisma.activityLog.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 جاري زرع البيانات الجديدة...");

  const defaultPassword = await bcrypt.hash("Password123", 10);

  // 2. إنشاء مستخدم ADMIN والحفاظ على المرجع لاستخدامه في التعليقات والأحداث
  const admin = await prisma.user.create({
    data: {
      name: "مدير النظام (Admin)",
      email: "admin@example.com",
      passwordHash: defaultPassword,
      role: Role.ADMIN,
    },
  });

  // 3. إنشاء 20 مستخدم MEMBER
  const members = [];
  for (let i = 1; i <= 20; i++) {
    const member = await prisma.user.create({
      data: {
        name: `عضو ${i}`,
        email: `member${i}@example.com`,
        passwordHash: defaultPassword,
        role: Role.MEMBER,
      },
    });
    members.push(member);
  }

  // 4. إنشاء 4 مدراء مع مشاريعهم ومهامهم والتعليقات والأحداث المرتبطة
  for (let i = 1; i <= 4; i++) {
    const manager = await prisma.user.create({
      data: {
        name: `المدير ${i}`,
        email: `manager${i}@example.com`,
        passwordHash: defaultPassword,
        role: Role.MANAGER,
      },
    });

    const project = await prisma.project.create({
      data: {
        name: `المشروع ${i}`,
        description: `وصف المشروع رقم ${i}`,
        ownerId: manager.id,
        status: ProjectStatus.PLANNING,
      },
    });

    // تسجيل حدث إنشاء المشروع
    await prisma.activityLog.create({
      data: {
        userId: manager.id,
        projectId: project.id,
        action: "CREATE_PROJECT",
        metadata: { projectName: project.name },
      },
    });

    const startIndex = (i - 1) * 5;
    const assignedMembers = members.slice(startIndex, startIndex + 5);

    for (let j = 0; j < assignedMembers.length; j++) {
      const assignedMember = assignedMembers[j];

      // أ) إنشاء المهمة
      const task = await prisma.task.create({
        data: {
          title: `المهمة ${j + 1} - ${project.name}`,
          description: `تفاصيل المهمة رقم ${j + 1} المسندة إلى ${assignedMember.name}`,
          projectId: project.id,
          ownerId: manager.id,
          assigneeId: assignedMember.id,
          status: taskStatuses[j % taskStatuses.length],
          priority: taskPriorities[j % taskPriorities.length],
          dueDate: new Date("2026-03-28"),
          estimatedHours: j + 1,
        },
      });

      // ب) تسجيل حدث إنشاء المهمة
      await prisma.activityLog.create({
        data: {
          userId: manager.id,
          projectId: project.id,
          taskId: task.id,
          action: "CREATE_TASK",
          metadata: { taskTitle: task.title },
        },
      });

      // جـ) إضافة التعليقات الثلاثة وتوثيق سجل النشاط لكل تعليق:

      // 1. تعليق من مدير النظام (Admin)
      await prisma.taskComment.create({
        data: {
          taskId: task.id,
          authorId: admin.id,
          content: `ملاحظة إدارية: يرجى الالتزام بالمعايير البرمجية والتأكد من إنجاز المهمة "${task.title}" في الوقت المحدد.`,
        },
      });
      await prisma.activityLog.create({
        data: {
          userId: admin.id,
          projectId: project.id,
          taskId: task.id,
          action: "ADD_COMMENT",
          metadata: { commentBy: "ADMIN", note: "تعليق إداري" },
        },
      });

      // 2. تعليق من مدير المشروع (Manager)
      await prisma.taskComment.create({
        data: {
          taskId: task.id,
          authorId: manager.id,
          content: `توجيه من المدير: تم إسناد هذه المهمة لك يا ${assignedMember.name}، يُرجى مراجعتي في حال وجود أي عقبات.`,
        },
      });
      await prisma.activityLog.create({
        data: {
          userId: manager.id,
          projectId: project.id,
          taskId: task.id,
          action: "ADD_COMMENT",
          metadata: { commentBy: "MANAGER", note: "توجيه المدير" },
        },
      });

      // 3. تعليق من الموظف المسند إليه المهمة (Member)
      await prisma.taskComment.create({
        data: {
          taskId: task.id,
          authorId: assignedMember.id,
          content: `تأكيد الاستلام: تم استلام المهمة وجاري البدء في تنفيذها وفق المتطلبات الموضحة.`,
        },
      });
      await prisma.activityLog.create({
        data: {
          userId: assignedMember.id,
          projectId: project.id,
          taskId: task.id,
          action: "ADD_COMMENT",
          metadata: { commentBy: "MEMBER", note: "تأكيد الاستلام" },
        },
      });
    }
  }

  console.log("✅ تم إكمال زرع البيانات والتعليقات والأحداث بنجاح!");
}

main()
  .catch((e) => {
    console.error("❌ حدث خطأ أثناء زرع البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });