"use client";

import React from "react";
import { Folder, CheckSquare, User, Clock } from "lucide-react";
import { ActivityLogWithUserProjectTask } from "@/src/types/ActivityLog";
import { formatArabicDate, formatTimeOnly } from "@/src/lib/event-formatters";

interface EventMetadataGridProps {
  event: ActivityLogWithUserProjectTask;
}

export function EventMetadataGrid({ event }: EventMetadataGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      {/* 1. المشروع المرتبط */}
      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-gray-100/90 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 mb-0.5">
            المشروع المرتبط
          </p>
          <p className="text-xs font-black text-gray-800 truncate max-w-[180px]">
            {event.project?.name || "غير محدد"}
          </p>
          <span className="text-[10px] font-mono text-blue-600 font-semibold">
            {event.projectId ? `PRJ-${event.projectId.slice(0, 8)}` : "—"}
          </span>
        </div>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Folder className="w-4 h-4" />
        </div>
      </div>

      {/* 2. المهمة المعنية */}
      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-gray-100/90 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 mb-0.5">
            المهمة المعنية
          </p>
          <p className="text-xs font-black text-gray-800 truncate max-w-[180px]">
            {event.task?.title || "غير محددة"}
          </p>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold">
            {event.taskId ? `TSK-${event.taskId.slice(0, 8)}` : "—"}
          </span>
        </div>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <CheckSquare className="w-4 h-4" />
        </div>
      </div>

      {/* 3. التوقيت الدقيق وتوقيع المنفذ */}
      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-gray-100/90 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 mb-0.5">
            التوقيت الدقيق وتوقيع المنفذ
          </p>
          <p className="text-xs font-black text-gray-800 font-mono" dir="ltr">
            {new Date(event.createdAt).toISOString()}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {formatArabicDate(event.createdAt)} -{" "}
            {formatTimeOnly(event.createdAt)}
          </p>
        </div>
        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {/* 4. المسؤول / المشغل الرسمي */}
      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-gray-100/90 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 mb-0.5">
            المسؤول / المشغل الرسمي
          </p>
          <p className="text-xs font-black text-gray-800">
            {event.user?.name || "مستخدم غير معرف"}
          </p>
        </div>
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
          <User className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
