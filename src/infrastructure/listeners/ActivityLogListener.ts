import { after } from "next/server"; // إذا كنت تستخدم Next.js 15 استبدلها بـ: import { after } from "next/server";
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

// إنشاء نسخة من الخدمة مباشرة
const activityLogService = new ActivityLogService(new ActivityLogRepository());

let isListenersRegistered = false;

export function registerActivityListeners(): void {
  // منع تسجيل المستمعين أكثر من مرة
  if (isListenersRegistered) return;
  isListenersRegistered = true;

  // 1. حدث إنشاء مشروع
  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_CREATED,
    (payload: ProjectCreatedPayload) => {
      after(async () => {
        try {
          await activityLogService.logActivity({
            userId: payload.userId,
            action: ACTIVITY_EVENTS.PROJECT_CREATED,
            projectId: payload.projectId,
          });
        } catch (error) {
          console.error("فشل تسجيل نشاط إنشاء المشروع:", error);
        }
      });
    }
  );

  // 2. حدث تحديث مشروع
  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_UPDATED,
    (payload: ProjectUpdatedPayload) => {
      after(async () => {
        try {
          await activityLogService.logActivity({
            userId: payload.userId,
            action: ACTIVITY_EVENTS.PROJECT_UPDATED,
            projectId: payload.projectId,
            metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
          });
        } catch (error) {
          console.error("فشل تسجيل نشاط تحديث المشروع:", error);
        }
      });
    }
  );

  // 3. حدث أرشفة مشروع
  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_ARCHIVED,
    (payload: ProjectArchivedPayload) => {
      after(async () => {
        try {
          await activityLogService.logActivity({
            userId: payload.userId,
            action: ACTIVITY_EVENTS.PROJECT_ARCHIVED,
            projectId: payload.projectId,
          });
        } catch (error) {
          console.error("فشل تسجيل نشاط أرشفة المشروع:", error);
        }
      });
    }
  );

  // 4. حدث حذف مشروع
  eventBus.on(
    ACTIVITY_EVENTS.PROJECT_DELETED,
    (payload: ProjectDeletedPayload) => {
      after(async () => {
        try {
          await activityLogService.logActivity({
            userId: payload.userId,
            action: ACTIVITY_EVENTS.PROJECT_DELETED,
            projectId: payload.projectId,
            metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
          });
        } catch (error) {
          console.error("فشل تسجيل نشاط حذف المشروع:", error);
        }
      });
    }
  );

  // 5. حدث إنشاء مهمة
  eventBus.on(ACTIVITY_EVENTS.TASK_CREATED,
     (payload: TaskCreatedPayload) => {
    after(async () => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.TASK_CREATED,
          projectId: payload.projectId,
          taskId: payload.taskId,
        });
      } catch (error) {
        console.error("فشل تسجيل نشاط إنشاء المهمة:", error);
      }
    });
  });

  // 6. حدث تحديث مهمة
  eventBus.on(ACTIVITY_EVENTS.TASK_UPDATED,
     (payload: TaskUpdatedPayload) => {
    after(async () => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.TASK_UPDATED,
          projectId: payload.projectId,
          taskId: payload.taskId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل نشاط تحديث المهمة:", error);
      }
    });
  });

  // 7. حدث حذف مهمة
  eventBus.on(ACTIVITY_EVENTS.TASK_DELETED, 
    (payload: TaskDeletedPayload) => {
    after(async () => {
      try {
        await activityLogService.logActivity({
          userId: payload.userId,
          action: ACTIVITY_EVENTS.TASK_DELETED,
          projectId: payload.projectId,
          taskId: payload.taskId,
          metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
        });
      } catch (error) {
        console.error("فشل تسجيل نشاط حذف المهمة:", error);
      }
    });
  });

  // 8. حدث إنشاء تعليق
  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_CREATED,
    (payload: CommentCreatedPayload) => {
      after(async () => {
        try {
          await activityLogService.logActivity({
            userId: payload.userId,
            action: ACTIVITY_EVENTS.COMMENT_CREATED,
            taskId: payload.taskId,
          });
        } catch (error) {
          console.error("فشل تسجيل نشاط إضافة تعليق:", error);
        }
      });
    }
  );

  // 9. حدث تحديث تعليق
  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_UPDATED,
    (payload: CommentUpdatedPayload) => {
      after(async () => {
        try {
          await activityLogService.logActivity({
            userId: payload.userId,
            action: ACTIVITY_EVENTS.COMMENT_UPDATED,
            taskId: payload.taskId,
            metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
          });
        } catch (error) {
          console.error("فشل تسجيل نشاط تحديث التعليق:", error);
        }
      });
    }
  );

  // 10. حدث حذف تعليق
  eventBus.on(
    ACTIVITY_EVENTS.COMMENT_DELETED,
    (payload: CommentDeletedPayload) => {
      after(async () => {
        try {
          await activityLogService.logActivity({
            userId: payload.userId,
            action: ACTIVITY_EVENTS.COMMENT_DELETED,
            taskId: payload.taskId,
            metadata: payload.oldInfo ? { oldInfo: payload.oldInfo } : undefined,
          });
        } catch (error) {
          console.error("فشل تسجيل نشاط حذف التعليق:", error);
        }
      });
    }
  );

  // 11. حدث تحديث بيانات المستخدم
  eventBus.on(ACTIVITY_EVENTS.USER_UPDATED,
     (payload: UserUpdatedPayload) => {
    after(async () => {
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
        console.error("فشل تسجيل نشاط تحديث المستخدم:", error);
      }
    });
  });
}