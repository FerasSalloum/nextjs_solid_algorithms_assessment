"use client";

export interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt?: string | Date;
}

interface ProjectInfoCardProps {
  project: ProjectData;
  completionRate: number;
  onEdit?: () => void;
}

export function ProjectInfoCard({
  project,
  completionRate,
  onEdit,
}: ProjectInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6 text-right rtl">
      {/* الهيدر العلوي للكارت */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
        >
          <span>✏️</span>
          <span>تعديل</span>
        </button>

        <span className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-full">
          المشروع الاستراتيجي
        </span>
      </div>

      {/* عنوان ووصف المشروع */}
      <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        {project.name}
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
        {project.description || "لا يوجد وصف محدد لهذا المشروع حالياً."}
      </p>

      {/* شريط نسبة التقدم الكلية */}
      <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/60">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-blue-600 font-extrabold">
            {completionRate}%
          </span>
          <div className="flex items-center gap-1.5 text-blue-900">
            <span>نسبة التقدم الكلية</span>
            <span className="text-blue-600">🔄</span>
          </div>
        </div>

        {/* مسار Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden dir-ltr">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
