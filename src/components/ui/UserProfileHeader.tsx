"use client";

import { useSession } from "next-auth/react";

interface UserProfileHeaderProps {
  activeProjectsCount?: number;
  assignedTasksCount?: number;
}

export function UserProfileHeader({
  activeProjectsCount = 0,
  assignedTasksCount = 0,
}: UserProfileHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {user?.name || "مستخدم جديد"}
        </h2>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          {user?.role === "ADMIN" ? "مدير النظام (Admin)" : "عضو الفريق"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">المشاريع التابعة</p>
          <p className="text-2xl font-bold text-gray-900">
            {String(activeProjectsCount).padStart(2, "0")}
            <span className="text-xs font-normal text-gray-500 mr-1">مشاريع نشطة</span>
          </p>
        </div>

        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">المهام الموكلة</p>
          <p className="text-2xl font-bold text-gray-900">
            {assignedTasksCount}
            <span className="text-xs font-normal text-gray-500 mr-1">مهمة عمل</span>
          </p>
        </div>
      </div>
    </div>
  );
}