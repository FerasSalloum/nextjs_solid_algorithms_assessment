import {
  Role,
  TaskStatus,
  Priority,
  User,
  Project,
  ProjectStatus,
  Task,
  TaskComment,
  ActivityLog,
} from "@prisma/client";
import { TaskWithAssigneeProjectOwner } from "../../../src/types/TaskRepository";
import { ProjectWithOwner } from "../../../src/types/ProjectRepository";
import {
  TaskCommentWithAuthor,
  TaskCommentWithTask,
} from "../../../src/types/TaskComment";

export const mockAdminUser: User = {
  id: "admin-123",
  email: "admin@example.com",
  name: "المشرف العام",
  passwordHash: "$2a$10$e83/fakehash",
  role: Role.ADMIN,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const mockManagerUser: User = {
  id: "manager-123",
  email: "manager@example.com",
  name: "مدير المشروع",
  passwordHash: "$2a$10$e83/fakehash",
  role: Role.MANAGER,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const mockMemberUser: User = {
  id: "member-123",
  email: "member@example.com",
  name: "عضو الفريق",
  passwordHash: "$2a$10$e83/fakehash",
  role: Role.MEMBER,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const mockProject: Project = {
  id: "project-123",
  name: "مشروع تطوير النظام",
  description: "وصف المشروع الاختباري",
  ownerId: mockManagerUser.id,
  status: ProjectStatus.ACTIVE,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const mockProjectWithOwner: ProjectWithOwner = {
  ...mockProject,
  owner: {
    id: mockManagerUser.id,
    name: mockManagerUser.name,
    email: mockManagerUser.email,
    passwordHash: mockManagerUser.passwordHash,
    role: mockManagerUser.role,
    createdAt: mockManagerUser.createdAt,
    updatedAt: mockManagerUser.updatedAt,
  },
};

export const mockTask: Task = {
  id: "task-123",
  title: "مهمة اختبار الصلاحيات",
  description: "وصف المهمة للتحقق من الوظائف",
  status: TaskStatus.TODO,
  priority: Priority.HIGH,
  projectId: mockProject.id,
  ownerId: mockManagerUser.id,
  assigneeId: mockMemberUser.id,
  dueDate: new Date("2026-12-31"),
  estimatedHours: 5,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const mockTaskWithAssigneeProjectOwner: TaskWithAssigneeProjectOwner = {
  ...mockTask,
  project: mockProject,
  owner: {
    id: mockManagerUser.id,
    name: mockManagerUser.name,
    email: mockManagerUser.email,
    passwordHash: mockManagerUser.passwordHash,
    role: mockManagerUser.role,
    createdAt: mockManagerUser.createdAt,
    updatedAt: mockManagerUser.updatedAt,
  },
  assignee: {
    id: mockMemberUser.id,
    name: mockMemberUser.name,
    email: mockMemberUser.email,
    passwordHash: mockMemberUser.passwordHash,
    role: mockMemberUser.role,
    createdAt: mockMemberUser.createdAt,
    updatedAt: mockMemberUser.updatedAt,
  },
};

export const mockTaskComment: TaskComment = {
  id: "taskComment-123",
  taskId: mockTask.id,
  authorId: mockMemberUser.id,
  content: "تعليق عام",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const mockTaskCommentWithAuthor: TaskCommentWithAuthor = {
  ...mockTaskComment,
  author: {
    id: mockMemberUser.id,
    name: mockMemberUser.name,
    email: mockMemberUser.email,
    passwordHash: mockMemberUser.passwordHash,
    role: mockMemberUser.role,
    createdAt: mockMemberUser.createdAt,
    updatedAt: mockMemberUser.updatedAt,
  },
};

export const mockTaskCommentWithTask: TaskCommentWithTask = {
  ...mockTaskComment,
  task: mockTask,
};

export const mockActivityLog: ActivityLog = {
  id: "ActivityLog-123",
  taskId: mockTask.id,
  projectId: mockProject.id,
  userId: mockManagerUser.id,
  action: "تحديث",
  createdAt: new Date("2026-01-01"),
  metadata: {
    previousStatus: "TODO",
    newStatus: "IN_PROGRESS",
    changedFields: ["status"],
  },
};
