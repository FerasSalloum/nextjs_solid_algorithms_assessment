"use client";

import React, { useState } from "react";
import axios from "axios";
import { TaskWithAssigneeProjectOwner } from "@/src/types/TaskRepository";


interface TaskCardProps {
  task: TaskWithAssigneeProjectOwner;
  projectId: string;
  onTaskUpdated: () => void;
}

export function TaskCard({ task, projectId, onTaskUpdated }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // خريطة حالات المهمة بالألوان والنصوص
  const statusConfig = {
    TODO: {
      label: "قيد التخطيط",
      bg: "bg-blue-50",
      text: "text-blue-600",
      dot: "bg-blue-500",
    },
    IN_PROGRESS: {
      label: "قيد العمل",
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    IN_REVIEW: {
      label: "قيد المراجعة",
      bg: "bg-purple-50",
      text: "text-purple-700",
      dot: "bg-purple-500",
    },
    CANCELLED: {
      label: "ملغا",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    DONE: {
      label: "مكتمل",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
  };

  // خريطة الأولويات
  const priorityConfig = {
    LOW: { label: "منخفض", bg: "bg-gray-100", text: "text-gray-600" },
    MEDIUM: { label: "متوسط", bg: "bg-blue-50", text: "text-blue-600" },
    HIGH: { label: "عالي", bg: "bg-amber-50", text: "text-amber-700" },
    CRITICAL: { label: "حرج", bg: "bg-rose-50", text: "text-rose-600" },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.TODO;
  const currentPriority =
    priorityConfig[task.priority] || priorityConfig.MEDIUM;

  // تغيير حالة المهمة بشكل سريع
  const handleStatusChange = async (newStatus: TaskWithAssigneeProjectOwner["status"]) => {
    setIsUpdating(true);
    try {
      await axios.patch(`/api/projects/${projectId}/tasks/${task.id}`, {
        status: newStatus,
      });
      onTaskUpdated();
    } catch (err: unknown) {
      console.error("حدث خطأ أثناء تحديث حالة المهمة:", err);
    } finally {
      setIsUpdating(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative rtl text-right hover:shadow-md transition-shadow">
      <div>
        {/* شريط العناوين والأوسمة العلوي */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* قائمة التعديل القابلة للإظهار والإخفاء */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✏️
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1.5 text-xs">
                <p className="px-3 py-1 font-bold text-gray-400 border-b border-gray-50">
                  تغيير الحالة:
                </p>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                  className="w-full text-right px-3 py-1.5 text-gray-700 hover:bg-amber-50 hover:text-amber-700 font-medium"
                >
                  🟡 قيد العمل
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("CANCELLED")}
                  className="w-full text-right px-3 py-1.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                >
                  🟢 مكتمل
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("TODO")}
                  className="w-full text-right px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                >
                  🔵 قيد التخطيط
                </button>
              </div>
            )}
          </div>

          {/* أوسمة الحالة والأولوية */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${currentPriority.bg} ${currentPriority.text}`}
            >
              {currentPriority.label}
            </span>
            <span
              className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-lg ${currentStatus.bg} ${currentStatus.text}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`}
              />
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* عنوان ووصف المهمة */}
        <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">
          {task.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {task.description || "لا يوجد وصف للمهمة."}
        </p>
      </div>

      {/* التفاصيل السفلى (التاريخ، المنشئ، المسند إليهم) */}
      <div className="border-t border-gray-50 pt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-gray-500">
          <span className="font-semibold text-gray-700">
            المنشئ:{" "}
            {task.owner?.name || "مستخدم مجهول"}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md dir-ltr font-mono">
              📅 {new Date(task.dueDate).toISOString().split("T")[0]}
            </span>
          )}
        </div>

        <div className="flex items-center justify-start gap-1 flex-wrap">
          <span className="text-gray-400 font-medium">المسند إليهم:</span>
          <span className="bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
            {task.assignee?.name || "مستخدم مجهول"}
          </span>
        </div>
      </div>
    </div>
  );
}
