import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "اسم المشروع مطلوب").max(50, "اسم المشروع طويل جداً"),
  description: z.string().min(2, "وصف المشروع مطلوب").max(500, "الوصف يجب ألا يتجاوز 500 حرف").optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;