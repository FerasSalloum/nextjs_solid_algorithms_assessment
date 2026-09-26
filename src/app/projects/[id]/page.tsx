"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import {
  ProjectInfoCard,
  ProjectData,
} from "@/src/components/project/ProjectInfoCard";
import { TaskCard } from "@/src/components/task/TaskCard";
import { CreateTaskModal } from "@/src/components/task/CreateTaskModal";
import { TaskWithAssigneeProjectOwner } from "@/src/types/TaskRepository";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskWithAssigneeProjectOwner[]>([]);
  const [loading, setLoading] = useState(true); // يبدأ بـ true افتراضياً
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. دالة إعادة التحديث (تُستخدم يدوياً عند التعديل أو إضافة مهمة)
  const refreshData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const tasksRes = await axios.get(`/api/projects/${projectId}/tasks`);
      setTasks(tasksRes.data);

      try {
        const projectRes = await axios.get(`/api/projects/${projectId}`);
        setProject(projectRes.data);
      } catch {
        // البيانات الاحتياطية في حال تعذر جلب المشروع
      }
    } catch (err: unknown) {
      console.error("خطأ أثناء تحديث البيانات:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // 2. الجلب الأولي للبيانات داخل useEffect بشكل آمن وبدون setState متزامن
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!projectId) return;

      try {
        const tasksRes = await axios.get(`/api/projects/${projectId}/tasks`);
        if (isMounted) {
          setTasks(tasksRes.data);
        }

        try {
          const projectRes = await axios.get(`/api/projects/${projectId}`);
          if (isMounted) {
            setProject(projectRes.data);
          }
        } catch {
          if (isMounted) {
            setProject({
              id: projectId,
              name: "منظومة الخدمات السحابية للشركات",
              description:
                "تطوير البنية التحتية والواجهات البرمجية للربط الحكومي والأنظمة المصرفية المعتمدة مع مراعاة أعلى معايير التوافقية والأمان المالي.",
              status: "PLANNING",
            });
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("خطأ أثناء جلب تفاصيل المشروع ومهامه:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    // تنظيف الطلب في حال تم إغلاق الصفحة قبل اكتماله
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // حساب نسبة التقدم الكلية
  const calculateCompletionRate = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((t) => t.status === "CANCELLED").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 rtl text-right">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* العودة وشريط هيدر التفاصيل */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
          >
            <span>Project Details</span>
            <span>➔</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-sm font-bold text-gray-500 shadow-xs">
            جاري تحميل تفاصيل المشروع والمهام...
          </div>
        ) : (
          <>
            {/* تفاصيل المشروع */}
            {project && (
              <ProjectInfoCard
                project={project}
                completionRate={calculateCompletionRate()}
                onEdit={refreshData}
              />
            )}

            {/* قسم المهام */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                مهام المشروع
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectId={projectId}
                    onTaskUpdated={refreshData}
                    onViewProject={(taskId) => router.push(`/tasks/${taskId}`)}
                  />
                ))}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white/80 hover:bg-blue-50/40 border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-55 group"
                >
                  <div className="w-11 h-11 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center text-2xl font-bold mb-3 group-hover:scale-110 transition-transform">
                    +
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    إضافة مهمة جديدة
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-50">
                    انقر لتعيين المسؤول وتحديد تاريخ الاستحقاق ومستوى الأولوية
                  </p>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* النافذة المنبثقة */}
      <CreateTaskModal
        projectId={projectId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
