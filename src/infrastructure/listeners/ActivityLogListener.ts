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
import { ActivityLogQueueProcessor } from "../queues/ActivityLogService";

const activityLogService = new ActivityLogService(new ActivityLogRepository());

// 1. إنشاء كائن معالج الطابور
export const activityQueueProcessor = new ActivityLogQueueProcessor(
  activityLogService,
);
let isListenersRegistered = false;
export function registerActivityListeners(): void {
  // 2. بدء المعالج الآلي في الخلفية (يعمل كل ثانيتين)
  if (isListenersRegistered) return; // منع التكرار
  isListenersRegistered = true;
  activityQueueProcessor.startWorker(2000, 20);

  // 3. توجيه جميع الأحداث إلى الطابور بـ O(1)
  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_CREATED,
    (payload: ProjectCreatedPayload) => {
      activityQueueProcessor.enqueueLog({
        userId: payload.userId,
        action: ACTIVITY_EVENTS.PROJECT_CREATED,
        projectId: payload.projectId,
      });
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_UPDATED,
    (payload: ProjectUpdatedPayload) => {
      activityQueueProcessor.enqueueLog({
        userId: payload.userId,
        action: ACTIVITY_EVENTS.PROJECT_UPDATED,
        projectId: payload.projectId,
        metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
      });
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_ARCHIVED,
    (payload: ProjectArchivedPayload) => {
      activityQueueProcessor.enqueueLog({
        userId: payload.userId,
        action: ACTIVITY_EVENTS.PROJECT_ARCHIVED,
        projectId: payload.projectId,
      });
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_DELETED,
    (payload: ProjectDeletedPayload) => {
      activityQueueProcessor.enqueueLog({
        userId: payload.userId,
        action: ACTIVITY_EVENTS.PROJECT_DELETED,
        projectId: payload.projectId,
        metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
      });
    },
  );

  eventBus.on(ACTIVITY_EVENTS.TASK_CREATED, (payload: TaskCreatedPayload) => {
    activityQueueProcessor.enqueueLog({
      userId: payload.userId,
      action: ACTIVITY_EVENTS.TASK_CREATED,
      projectId: payload.projectId,
      taskId: payload.taskId,
    });
  });

  eventBus.on(ACTIVITY_EVENTS.TASK_UPDATED, (payload: TaskUpdatedPayload) => {
    activityQueueProcessor.enqueueLog({
      userId: payload.userId,
      action: ACTIVITY_EVENTS.TASK_UPDATED,
      projectId: payload.projectId,
      taskId: payload.taskId,
      metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
    });
  });

  eventBus.on(ACTIVITY_EVENTS.TASK_DELETED, (payload: TaskDeletedPayload) => {
    activityQueueProcessor.enqueueLog({
      userId: payload.userId,
      action: ACTIVITY_EVENTS.TASK_DELETED,
      projectId: payload.projectId,
      taskId: payload.taskId,
      metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
    });
  });

  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_CREATED,
    (payload: CommentCreatedPayload) => {
      activityQueueProcessor.enqueueLog({
        userId: payload.userId,
        action: ACTIVITY_EVENTS.COMMENT_CREATED,
        taskId: payload.taskId,
      });
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_UPDATED,
    (payload: CommentUpdatedPayload) => {
      activityQueueProcessor.enqueueLog({
        userId: payload.userId,
        action: ACTIVITY_EVENTS.COMMENT_UPDATED,
        taskId: payload.taskId,
        metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
      });
    },
  );

  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_DELETED,
    (payload: CommentDeletedPayload) => {
      activityQueueProcessor.enqueueLog({
        userId: payload.userId,
        action: ACTIVITY_EVENTS.COMMENT_DELETED,
        taskId: payload.taskId,
        metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
      });
    },
  );

  eventBus.on(ACTIVITY_EVENTS.USER_UPDATED, (payload: UserUpdatedPayload) => {
    activityQueueProcessor.enqueueLog({
      userId: payload.executorId,
      action: ACTIVITY_EVENTS.USER_UPDATED,
      metadata: {
        targetUserId: payload.targetUserId,
        ...(payload.oldInfo && { oldInfo: payload.oldInfo }),
      },
    });
  });
}
