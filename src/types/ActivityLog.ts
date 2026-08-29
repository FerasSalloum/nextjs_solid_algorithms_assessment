import { Prisma } from "@prisma/client";

// 1. نوع يمثل: التعليق + تفاصيل الكاتب
export type ActivityLogWithUser = Prisma.ActivityLogGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } };
  };
}>;
export type ActivityLogWithUserProjectTask = Prisma.ActivityLogGetPayload<{
  include: {
    user: { select: { id: true; name: true } };
    project: { select: { id: true; name: true } };
    task: { select: { id: true; title: true } };
  };
}>;
