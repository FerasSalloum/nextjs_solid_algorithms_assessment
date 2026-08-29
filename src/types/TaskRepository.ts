import { Prisma } from "@prisma/client";

// 1. نوع يمثل: التعليق + تفاصيل الكاتب
export type TaskWithAssigneeProject = Prisma.TaskGetPayload<{
  include: { assignee: true; project: true };
}>;
