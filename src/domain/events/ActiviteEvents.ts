import { Project, Task, TaskComment, User  } from "@prisma/client";

export const ACTIVITY_EVENTS = {
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_UPDATED: "PROJECT_UPDATED",
  PROJECT_ARCHIVED: "PROJECT_ARCHIVED",
  PROJECT_DELETED: "PROJECT_DELETED",
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_UPDATED: "COMMENT_UPDATED",
  COMMENT_DELETED: "COMMENT_DELETED",
  USER_UPDATED: "USER_UPDATED",
} as const;

export type ActivityEventType =
  (typeof ACTIVITY_EVENTS)[keyof typeof ACTIVITY_EVENTS];

// هياكل البيانات المنقولة مع كل حدث

export interface ProjectCreatedPayload {
  userId: string;
  projectId: string;
}

export interface ProjectUpdatedPayload {
  userId: string;
  projectId: string;
  oldInfo?: Partial<Project>;
}

export interface ProjectArchivedPayload {
  userId: string;
  projectId: string;
}

export interface ProjectDeletedPayload {
  userId: string;
  projectId: string;
  oldInfo?: Partial<Project>;
}

export interface TaskCreatedPayload {
  userId: string;
  taskId: string;
  projectId: string;
}

export interface TaskUpdatedPayload {
  userId: string;
  taskId: string;
  projectId: string;
  oldInfo?: Partial<Task>;
}

export interface TaskDeletedPayload {
  userId: string;
  taskId: string;
  projectId: string;
  oldInfo?: Partial<Task>;
}

export interface CommentCreatedPayload {
  userId: string; 
  taskId: string;
  commentId: string;
}

export interface CommentUpdatedPayload {
  userId: string;
  taskId: string;
  commentId: string;
  oldInfo?: Partial<TaskComment>;
}

export interface CommentDeletedPayload {
  userId: string;
  taskId: string;
  commentId: string;
  oldInfo?: Partial<TaskComment>;
}

export interface UserUpdatedPayload {
  executorId: string;
  targetUserId: string;
  oldInfo?: Partial<User>;
}
