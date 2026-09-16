import { eventBus } from "../events/EventBus";
import {
  ACTIVITY_EVENTS,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  ProjectArchivedPayload,
  ProjectDeletedPayload,
  TaskCreatedPayload,
  TaskUpdatedPayload,
  TaskDeletedPayload,
  CommentCreatedPayload,
  CommentUpdatedPayload,
  CommentDeletedPayload,
  UserUpdatedPayload,
} from "@/src/domain/events/ActiviteEvents";
import { ActivityLogService } from "@/src/application/services/ActivityLogService";
import { ActivityLogRepository } from "@/src/infrastructure/repositories/ActivityLogRepository";

const activityLogService = new ActivityLogService(new ActivityLogRepository());

export function registerActivityListeners(): void {
  // 1. أحداث المشاريع
  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_CREATED,
    async (payload: ProjectCreatedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.PROJECT_CREATED,
          projectId: payload.projectId,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث PROJECT_CREATED:", error);
      }
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_UPDATED,
    async (payload: ProjectUpdatedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.PROJECT_UPDATED,
          projectId: payload.projectId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث PROJECT_UPDATED:", error);
      }
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_ARCHIVED,
    async (payload: ProjectArchivedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.PROJECT_ARCHIVED,
          projectId: payload.projectId,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث PROJECT_ARCHIVED:", error);
      }
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_DELETED,
    async (payload: ProjectDeletedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload?.userId,
          action: ACTIVITY_EVENTS.PROJECT_DELETED,
          projectId: payload.projectId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث PROJECT_DELETED:", error);
      }
    },
  );

  // 2. أحداث المهام
  eventBus.on(
    ACTIVITY_EVENTS.TASK_CREATED,
    async (payload: TaskCreatedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.TASK_CREATED,
          projectId: payload.projectId,
          taskId: payload.taskId,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث TASK_CREATED:", error);
      }
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.TASK_UPDATED,
    async (payload: TaskUpdatedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.TASK_UPDATED,
          projectId: payload.projectId,
          taskId: payload.taskId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث TASK_UPDATED:", error);
      }
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.TASK_DELETED,
    async (payload: TaskDeletedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.TASK_DELETED,
          projectId: payload.projectId,
          taskId: payload.taskId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث TASK_DELETED:", error);
      }
    },
  );

  // 3. أحداث التعليقات
  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_CREATED,
    async (payload: CommentCreatedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.COMMENT_CREATED,
          taskId: payload.taskId,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث COMMENT_CREATED:", error);
      }
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_UPDATED,
    async (payload: CommentUpdatedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.COMMENT_UPDATED,
          taskId: payload.taskId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث COMMENT_UPDATED:", error);
      }
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_DELETED,
    async (payload: CommentDeletedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.COMMENT_DELETED,
          taskId: payload.taskId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل حدث COMMENT_DELETED:", error);
      }
    },
  );

  // 4. أحداث المستخدمين
  eventBus.on(
    ACTIVITY_EVENTS.USER_UPDATED,
    async (payload: UserUpdatedPayload) => {
      try {
        await activityLogService.logActivity({
          userId: payload.executorId,
          action: ACTIVITY_EVENTS.USER_UPDATED,
          metadata: {
            targetUserId: payload.targetUserId,
            ...(payload.oldInfo && { oldInfo: payload.oldInfo }),
          },
        });
      } catch (error) {
        console.error("فشل تسجيل حدث USER_UPDATED:", error);
      }
    },
  );
}
