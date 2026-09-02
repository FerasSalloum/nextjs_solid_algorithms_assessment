import { vi } from "vitest";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { IProjectRepository } from "@src/domain/interfaces/IProjectRepository";
import { ITaskCommentRepository } from "@src/domain/interfaces/ITaskCommentRepository";
import { IActivityLogRepository } from "@src/domain/interfaces/IActivityLogRepository";
import { ITaskRepository } from "@src/domain/interfaces/ITaskRepository";

export const createMockTaskRepository = (): ITaskRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

export const createMockUserRepository = (): IUserRepository => ({
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByRole: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

export const createMockProjectRepository = (): IProjectRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  archive: vi.fn(),
  delete: vi.fn(),
});

export const createMockTaskCommentRepository = (): ITaskCommentRepository => ({
  findById: vi.fn(),
  findByTaskId: vi.fn(),
  findByAuthorId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

export const createMockActivityLogRepository = (): IActivityLogRepository => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
});
