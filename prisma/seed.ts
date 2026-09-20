import {
  PrismaClient,
  Role,
  ProjectStatus,
  TaskStatus,
  Priority,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// ثوابت أحداث الأنشطة
const ACTIVITY_EVENTS = {
  PROJECT_CREATED: "PROJECT_CREATED",
  TASK_CREATED: "TASK_CREATED",
  COMMENT_CREATED: "COMMENT_CREATED",
} as const;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. تنظيف البيانات السابقة بالترتيب الصحيح تجنباً لمشاكل المفاتيح الأجنبية
  await prisma.activityLog.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleanup finished.");

  // 2. إنشاء المستخدم المسؤول (Admin)
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // 3. إنشاء 4 مدراء مشاريع (Managers)
  const managers = [];
  for (let i = 1; i <= 4; i++) {
    const manager = await prisma.user.create({
      data: {
        name: `Manager ${i}`,
        email: `manager${i}@example.com`,
        passwordHash,
        role: Role.MANAGER,
      },
    });
    managers.push(manager);
  }

  // 4. إنشاء 20 عضواً (Members)
  const members = [];
  for (let i = 1; i <= 20; i++) {
    const member = await prisma.user.create({
      data: {
        name: `Member ${i}`,
        email: `member${i}@example.com`,
        passwordHash,
        role: Role.MEMBER,
      },
    });
    members.push(member);
  }

  console.log("👥 Users created successfully.");

  // 5. إنشاء 4 مشاريع وتسجيل حدث إنشاء لكل مشروع
  const projectStatuses = [
    ProjectStatus.PLANNING,
    ProjectStatus.ACTIVE,
    ProjectStatus.COMPLETED,
    ProjectStatus.ARCHIVED,
  ];

  const projects = [];
  for (let i = 0; i < 4; i++) {
    const owner = managers[i];
    const project = await prisma.project.create({
      data: {
        name: `Project ${i + 1}: ${projectStatuses[i].toLowerCase()} Phase`,
        description: `This is a comprehensive description for project ${i + 1}.`,
        ownerId: owner.id,
        status: projectStatuses[i],
      },
    });
    projects.push(project);

    // 🟢 تسجيل حدث إنشاء المشروع (PROJECT_CREATED)
    await prisma.activityLog.create({
      data: {
        userId: owner.id,
        projectId: project.id,
        action: ACTIVITY_EVENTS.PROJECT_CREATED,
        metadata: {
          projectName: project.name,
          ownerName: owner.name,
        },
      },
    });
  }

  console.log("📁 Projects and PROJECT_CREATED logs created.");

  // 6. إنشاء 5 مهام لكل مشروع + تسجيل حدث إنشاء لكل مهمة
  const taskStatuses = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
    TaskStatus.CANCELLED,
  ];
  const priorities = [
    Priority.LOW,
    Priority.MEDIUM,
    Priority.HIGH,
    Priority.CRITICAL,
  ];

  const createdTasks = [];

  for (const project of projects) {
    for (let j = 0; j < 5; j++) {
      const assignee = members[Math.floor(Math.random() * members.length)];

      const task = await prisma.task.create({
        data: {
          title: `Task ${j + 1} - ${project.name}`,
          description: `Execute objective ${j + 1} for ${project.name}. Ensure SOLID principles are applied.`,
          status: taskStatuses[j % 5],
          priority: priorities[j % 4],
          projectId: project.id,
          ownerId: project.ownerId,
          assigneeId: assignee.id,
          dueDate: new Date(Date.now() + (j + 1) * 2 * 24 * 60 * 60 * 1000),
          estimatedHours: (j + 1) * 4.5,
        },
      });
      createdTasks.push(task);

      // 🟢 تسجيل حدث إنشاء المهمة (TASK_CREATED)
      await prisma.activityLog.create({
        data: {
          userId: project.ownerId,
          projectId: project.id,
          taskId: task.id,
          action: ACTIVITY_EVENTS.TASK_CREATED,
          metadata: {
            taskTitle: task.title,
            assignedToId: assignee.id,
            assignedToName: assignee.name,
          },
        },
      });
    }
  }

  console.log("✅ Tasks and TASK_CREATED logs created.");

  // 7. إضافة تعليقات على المهام + تسجيل حدث إنشاء لكل تعليق
  for (let i = 0; i < createdTasks.length; i++) {
    const task = createdTasks[i];
    const author = members[i % members.length];

    // إنشاء تعليق للمهمة
    const comment = await prisma.taskComment.create({
      data: {
        taskId: task.id,
        authorId: author.id,
        content: `ملاحظة وتحديث على المهمة "${task.title}": تم مراجعة الشروط وتطبيق المعايير المطلوبة.`,
      },
    });

    // 🟢 تسجيل حدث إنشاء التعليق (COMMENT_CREATED)
    await prisma.activityLog.create({
      data: {
        userId: author.id,
        projectId: task.projectId,
        taskId: task.id,
        action: ACTIVITY_EVENTS.COMMENT_CREATED,
        metadata: {
          commentId: comment.id,
          contentPreview: comment.content.slice(0, 50),
        },
      },
    });
  }

  console.log("💬 Task Comments and COMMENT_CREATED logs created.");
  console.log("🚀 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
