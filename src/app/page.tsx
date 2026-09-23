// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { UserProfileHeader } from "@/src/components/ui/UserProfileHeader";
import { ProjectCard, ProjectData } from "@/src/components/project/ProjectCard";
import { CreateProjectModal } from "@/src/components/project/CreateProjectModal";

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // جلب كافة المشاريع عبر الـ API المخصص بدون أي فلتر
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("خطأ أثناء جلب المشاريع:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // تصفية المشاريع محلياً حسب خانة البحث
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 rtl text-right">
      {/* الشريط العلوي */}
      <header className="bg-white border-b border-gray-100 py-3 px-4 flex justify-between items-center sticky top-0 z-10">
        <div className="text-xs text-gray-500">
          مدير المشاريع /{" "}
          <span className="font-semibold text-gray-800">Home</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
          👤
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* 1. كمبوننت معلومات المستخدم من الجلسة */}
        <UserProfileHeader activeProjectsCount={projects.length} />

        {/* 2. شريط البحث والتصفية */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في سجل المشاريع..."
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
            />
            <span className="absolute right-3 top-3 text-gray-400 text-sm">
              🔍
            </span>
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50">
            ⚙️
          </button>
        </div>

        {/* 3. قائمة المشاريع الحالية */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">
            المشاريع الحالية
          </h3>

          {loading ? (
            <div className="text-center py-8 text-xs text-gray-500">
              جاري تحميل المشاريع...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500">
              لا توجد مشاريع حالية
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewProject={(id) => alert(`استعراض المشروع رقم: ${id}`)}
              />
            ))
          )}
        </div>

        {/* 4. بطاقة إضافة مشروع جديد (Trigger Card) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center mx-auto mb-2 text-xl font-bold group-hover:scale-110 transition-transform">
            +
          </div>
          <p className="text-sm font-bold text-gray-900">إضافة مشروع جديد</p>
          <p className="text-xs text-gray-400 mt-1">
            انقر لتحديد اسم ونطاق المشروع وتعيين تفاصيل العمل
          </p>
        </button>
      </main>

      {/* 5. التذييل (Footer) */}
      <footer className="text-center py-6 text-xs text-gray-400 space-y-2">
        <p className="font-semibold text-gray-700">مدير المشاريع</p>
        <div className="flex justify-center gap-3">
          <span>الصفحة الرئيسية</span> • <span>الصفحة الشخصية</span> •{" "}
          <span>صفحة الأحداث</span>
        </div>
        <p>جميع الحقوق محفوظة © 2026</p>
      </footer>

      {/* 6. الكمبوننت الخاص بحوار إضافة مشروع جديد */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
