// ⚠️ يجب أن يكون dotenv/config في أول سطر لضمان قراءة ملف .env أولاً
import "dotenv/config";
import { prisma } from "../src/infrastructure/database/prisma";
import { Role, TaskStatus, Priority, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🧹 جاري مسح البيانات القديمة...");

  // 1. مسح البيانات بالترتيب لتجنب أخطاء القيود الخارجية
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 جاري زرع البيانات الجديدة...");

  const defaultPassword = await bcrypt.hash("Password123", 10);

  // 2. إنشاء مستخدم ADMIN
  await prisma.user.create({
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

  // 4. إنشاء 4 مدراء مع مشاريعهم ومهامهم
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

    const startIndex = (i - 1) * 5;
    const assignedMembers = members.slice(startIndex, startIndex + 5);

    for (let j = 0; j < assignedMembers.length; j++) {
      const assignedMember = assignedMembers[j];
      await prisma.task.create({
        data: {
          title: `المهمة ${j + 1} - ${project.name}`,
          description: `تفاصيل المهمة رقم ${j + 1} المسندة إلى ${assignedMember.name}`,
          projectId: project.id,
          ownerId: manager.id,
          assigneeId: assignedMember.id,
          status: TaskStatus.TODO,
          priority: Priority.MEDIUM,
        },
      });
    }
  }

  console.log("✅ تم إكمال زرع البيانات بنجاح!");
}
main()
  .catch((e) => {
    console.error("❌ حدث خطأ أثناء زرع البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
