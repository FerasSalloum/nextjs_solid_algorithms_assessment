import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "عنوان المهمة مطلوب").max(150, "العنوان طويل جداً"),
  description: z.string().optional(),
  projectId: z.string().uuid("معرف المشروع غير صالح"),
  assigneeId: z.string().uuid("معرف المستخدم غير صالح").nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.number().positive("عدد الساعات يجب أن يكون رقماً موجباً").optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;