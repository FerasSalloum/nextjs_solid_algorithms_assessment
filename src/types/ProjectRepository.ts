import { Prisma } from "@prisma/client";

// 1. نوع يمثل: التعليق + تفاصيل الكاتب
export type ProjectWithOwner = Prisma.ProjectGetPayload<{
  include: { owner: true };
}>;
export type ProjectWithOwnerTask = Prisma.ProjectGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    tasks: true;
  };
}>;
