import { z } from "zod";

export const createCommentSchema = z.object({
  taskId: z.string().uuid("معرف المهمة غير صالح"),
  content: z.string().min(1, "نص التعليق مطلوب").max(500, "التعليق طويل جداً"),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "نص التعليق مطلوب").max(500, "التعليق طويل جداً"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;