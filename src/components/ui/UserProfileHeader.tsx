"use client";

import { useSession } from "next-auth/react";

interface UserProfileHeaderProps {
  activeProjectsCount?: number;
  assignedTasksCount?: number;
}

export function UserProfileHeader({}: UserProfileHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {user?.name || "مستخدم جديد"}
        </h2>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          {user?.role || "عضو الفريق"}
        </span>
      </div>
    </div>
  );
}
