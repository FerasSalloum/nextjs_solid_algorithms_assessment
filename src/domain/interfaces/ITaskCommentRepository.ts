import { TaskCommentWithAuthor, TaskCommentWithTask } from "@/src/types/TaskComment";
import { TaskComment } from "@prisma/client";

export interface ITaskCommentRepository {
  findById(id: string): Promise<TaskCommentWithAuthor | null>;
  findByTaskId(taskId: string): Promise<TaskCommentWithAuthor[]>;
  findByAuthorId(authorId: string): Promise<TaskCommentWithTask[]>;
  create(data: {
    taskId: string;
    authorId: string;
    content: string;
  }): Promise<TaskComment>;
  update(id: string, content: string): Promise<TaskComment>;
  delete(id: string): Promise<void>;
}
 