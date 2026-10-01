import { Prisma } from "@prisma/client";

export type UserWithAll = Prisma.UserGetPayload<{
  include: {
    projects: true;
    createdTasks: true;
    tasksAssignee: true;
  };
}>;
