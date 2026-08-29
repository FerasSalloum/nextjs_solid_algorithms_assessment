import { Prisma } from "@prisma/client";

// 1. نوع يمثل: التعليق + تفاصيل الكاتب
export type TaskCommentWithAuthor = Prisma.TaskCommentGetPayload<{
  include: { author: true };
}>;

// 2. نوع يمثل: التعليق + تفاصيل المهمة
export type TaskCommentWithTask = Prisma.TaskCommentGetPayload<{
  include: { task: true };
}>;
 