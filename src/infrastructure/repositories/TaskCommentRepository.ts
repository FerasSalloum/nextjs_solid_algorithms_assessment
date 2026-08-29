import { prisma } from "@/src/lib/prisma";
import { ITaskCommentRepository } from "@/src/domain/interfaces/ITaskCommentRepository";
import { TaskComment } from "@prisma/client";
import { TaskCommentWithAuthor, TaskCommentWithTask } from "@/src/types/TaskComment";

export class TaskCommentRepository implements ITaskCommentRepository {
  async findById(id: string): Promise<TaskCommentWithAuthor | null> {
    return prisma.taskComment.findUnique({ 
      where: { id },
      include: { author: true } // من المفيد جلب بيانات الكاتب مع التعليق
    });
  }

  async findByTaskId(taskId: string): Promise<TaskCommentWithAuthor[]> {
    return prisma.taskComment.findMany({
      where: { taskId },
      include: { author: true },
      orderBy: { createdAt: "desc" }, // ترتيب من الأحدث للأقدم
    });
  }

  async findByAuthorId(authorId: string): Promise<TaskCommentWithTask[]> {
    return prisma.taskComment.findMany({
      where: { authorId },
      include: { task: true },
      orderBy: { createdAt: "desc" }, // ترتيب من الأحدث للأقدم
    }); 
  }

  async create(data: {
    taskId: string;
    authorId: string;
    content: string;
  }): Promise<TaskComment> {
    return prisma.taskComment.create({ data });
  }

  async update(id: string, content: string): Promise<TaskComment> {
    return prisma.taskComment.update({
      where: { id },
      data: { content },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.taskComment.delete({ where: { id } });
  }
}