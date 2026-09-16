import { ITaskCommentRepository } from "@/src/domain/interfaces/ITaskCommentRepository";
import {
  TaskCommentWithAuthor,
  TaskCommentWithTask,
} from "@/src/types/TaskComment";
import { TaskComment, Role } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  AppError,
} from "@/src/domain/errors/AppError";
import { eventBus } from "@/src/infrastructure/events/EventBus";
import {
  ACTIVITY_EVENTS,
  CommentCreatedPayload,
  CommentDeletedPayload,
  CommentUpdatedPayload,
} from "@/src/domain/events/ActiviteEvents";

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
      throw new AppError("محتوى التعليق لا يمكن أن يكون فارغاً", 400);
    }
    const newTaskComment = await this.commentRepository.create(data);
    const payload: CommentCreatedPayload = {
      userId: data.authorId,
      taskId: data.taskId,
      commentId: newTaskComment.id,
    };
    eventBus.emit(ACTIVITY_EVENTS.COMMENT_CREATED, payload);
    return newTaskComment;
  }

  async updateComment(
    executorId: string,
    executorRole: Role,
    commentId: string,
    content: string,
  ): Promise<TaskComment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError("التعليق غير موجود");
    }

    if (!content || content.trim() === "") {
      throw new AppError("محتوى التعليق لا يمكن أن يكون فارغاً", 400);
    }

    if (
      executorRole === Role.ADMIN ||
      executorRole === Role.MANAGER ||
      comment.authorId === executorId
    ) {
      const newTaskComment = await this.commentRepository.update(
        commentId,
        content,
      );
      const payload: CommentUpdatedPayload = {
        userId: executorId,
        taskId: comment.taskId,
        commentId: comment.id,
        oldInfo: comment,
      };
      eventBus.emit(ACTIVITY_EVENTS.COMMENT_UPDATED, payload);
      return newTaskComment;
    }

    throw new ForbiddenError("صلاحيات غير كافية: لا يمكنك تعديل تعليق شخص آخر");
  }

  async deleteComment(
    executorId: string,
    executorRole: Role,
    commentId: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError("التعليق غير موجود");
    }

    if (
      executorRole === Role.ADMIN ||
      executorRole === Role.MANAGER ||
      comment.authorId === executorId
    ) {
      await this.commentRepository.delete(commentId);
      const payload: CommentDeletedPayload = {
        userId: executorId,
        taskId: comment.taskId,
        commentId: comment.id,
        oldInfo: comment,
      };
      eventBus.emit(ACTIVITY_EVENTS.COMMENT_DELETED, payload);
      return;
    }

    throw new ForbiddenError("صلاحيات غير كافية: لا يمكنك حذف هذا التعليق");
  }
}
