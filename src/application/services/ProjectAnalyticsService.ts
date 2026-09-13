import { IProjectRepository } from "@/src/domain/interfaces/IProjectRepository";
import { ITaskRepository } from "@/src/domain/interfaces/ITaskRepository";
import { calculateProjectAnalytics } from "@/src/algorithms/projectAnalyticsCalculator";
import { NotFoundError, ForbiddenError } from "@/src/domain/errors/AppError";
import { Role } from "@prisma/client";

export class ProjectAnalyticsService {
  constructor(
    private projectRepository: IProjectRepository,
    private taskRepository: ITaskRepository,
  ) {}

  async getProjectAnalytics(
    executorId: string,
    executorRole: Role,
    projectId: string,
  ) {
    // 1. التحقق من وجود المشروع عبر مستودع المشاريع
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("المشروع غير موجود");
    }

    // 2. التحقق من صلاحيات المستخدم (ADMIN أو مالك المشروع فقط)
    if (executorRole !== Role.ADMIN && project.ownerId !== executorId) {
      throw new ForbiddenError(
        "لا تملك صلاحية للاطلاع على تحليلات هذا المشروع",
      );
    }

    // 3. جلب جميع المهام الخاصة بالمشروع باستخدام مستودع المهام
    const tasks = await this.taskRepository.findAll({ projectId });

    // 4. تمرير المهام إلى دالة الخوارزمية البحتة التي أنشأناها في الخطوة السابقة
    const analytics = calculateProjectAnalytics(tasks);

    // 5. دمج معلومات المشروع الأساسية مع نتائج التحليلات وإرجاعها
    return {
      projectId: project.id,
      projectName: project.name,
      ...analytics,
    };
  }
}
