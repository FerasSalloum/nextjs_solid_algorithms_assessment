import { Prisma } from "@prisma/client";

// 1. نوع يمثل: التعليق + تفاصيل الكاتب
export type TaskWithAssigneeProjectOwner = Prisma.TaskGetPayload<{
  include: { assignee: true; project: true; owner: true };
}>;
