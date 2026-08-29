import { Prisma } from "@prisma/client";

// 1. نوع يمثل: التعليق + تفاصيل الكاتب
export type ProjectWithOwner = Prisma.ProjectGetPayload<{
  include: { owner: true };
}>; 