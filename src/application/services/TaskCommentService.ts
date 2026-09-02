import { ITaskCommentRepository } from "@/src/domain/interfaces/ITaskCommentRepository";
import {
  TaskCommentWithAuthor,
  TaskCommentWithTask,
} from "@/src/types/TaskComment";
import { TaskComment, Role } from "@prisma/client";

export class TaskCommentService {
  constructor(private commentRepository: ITaskCommentRepository) {}

  async getCommentsByTaskId(taskId: string): Promise<TaskCommentWithAuthor[]> {
    return this.commentRepository.findByTaskId(taskId);
  }

  async findByAuthorId(authorId: string): Promise<TaskCommentWithTask[]> {
    return this.commentRepository.findByAuthorId(authorId);
  }

  async createComment(data: {
    taskId: string;
    authorId: string;
    content: string;
  }): Promise<TaskComment> {
    if (!data.content || data.content.trim() === "") {
      throw new Error("محتوى التعليق لا يمكن أن يكون فارغاً");
    }

    return this.commentRepository.create(data);
  }

  async updateComment(
    executorId: string,
    executorRole: Role,
    commentId: string,
    content: string,
  ): Promise<TaskComment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error("التعليق غير موجود");

    if (!content || content.trim() === "") {
      throw new Error("محتوى التعليق لا يمكن أن يكون فارغاً");
    }

    if (
      executorRole === Role.ADMIN ||
      executorRole === Role.MANAGER ||
      comment.authorId === executorId
    ) {
      return this.commentRepository.update(commentId, content);
    }

    throw new Error("صلاحيات غير كافية: لا يمكنك تعديل تعليق شخاص آخر");
  }

  async deleteComment(
    executorId: string,
    executorRole: Role,
    commentId: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error("التعليق غير موجود");

    if (executorRole === Role.ADMIN || executorRole === Role.MANAGER) {
      await this.commentRepository.delete(commentId);
      return;
    }

    throw new Error("صلاحيات غير كافية: لا يمكنك حذف هذا التعليق");
  }
}
