"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserProfileHeader } from "@/src/components/ui/UserProfileHeader";
import {
  ProjectCard,
} from "@/src/components/project/ProjectCard";
import { CreateProjectModal } from "@/src/components/project/CreateProjectModal";
import { useRouter } from "next/navigation";
import { ProjectWithOwnerTask } from "../types/ProjectRepository";

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectWithOwnerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  // 1. دالة إعادة جلب المشاريع
  const refreshProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("خطأ أثناء جلب المشاريع:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. جلب البيانات عند تحميل المكون لأول مرة
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const response = await axios.get("/api/projects");
        if (isMounted) {
          setProjects(response.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error("خطأ أثناء جلب المشاريع:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // الفلترة المحلية بالبحث
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    /* خلفية متدرجة بزرقة خفيفة وأنيقة مع دعم كافة الشاشات */
    <div className="min-h-screen bg-linear-to-b from-blue-50/50 via-slate-50 to-blue-50/30 pb-20 rtl text-right">
      {/* الحاوية الرئيسية بحد أقصى مرن يتكيف من الهواتف حتى شاشات العرض الكبيرة */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* معلومات المستخدم من الجلسة */}
        <UserProfileHeader />

        {/* شريط البحث */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <div className="relative flex-1 max-w-2xl mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في سجل المشاريع..."
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
            />
            <span className="absolute right-3 top-3.5 text-gray-400 text-sm">
              🔍
            </span>
          </div>
        </div>

        {/* قسم المشاريع الحالية */}
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            المشاريع الحالية
          </h3>

          {loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center text-sm font-semibold text-gray-700 shadow-sm border border-blue-50/50">
              جاري تحميل المشاريع...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center text-sm font-semibold text-gray-700 shadow-sm border border-blue-50/50">
              لا توجد مشاريع حالية
            </div>
          ) : (
            /* عرض المشاريع على شكل شبكة متجاوبة (1 عمود للموبايل، 2 للتابلت، 3 للشاشات الكبيرة) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewProject={(id) => router.push(`/projects/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* زر إظهار النافذة المنبثقة لإضافة مشروع */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 sm:p-8 text-center hover:bg-blue-50/40 transition-all group shadow-sm cursor-pointer"
        >
          <div className="w-12 h-12 bg-blue-100/70 rounded-2xl text-blue-600 flex items-center justify-center mx-auto mb-3 text-2xl font-bold group-hover:scale-110 transition-transform">
            +
          </div>
          <p className="text-base font-bold text-gray-900">إضافة مشروع جديد</p>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">
            انقر لتحديد اسم ونطاق المشروع وتعيين تفاصيل العمل
          </p>
        </button>
      </main>

      {/* النافذة المنبثقة */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshProjects}
      />
    </div>
  );
}
