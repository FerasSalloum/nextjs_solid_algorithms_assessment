// src/app/events/components/EventCard.tsx
"use client";

import React from "react";
import { User, Clock } from "lucide-react";
import { ActivityLogWithUser } from "@/src/types/ActivityLog"; // أو المسار الذي يحتوي نوعك
import {
  formatArabicDate,
  formatTimeOnly,
  getActionBadgeStyle,
} from "@/src/lib/event-formatters";

interface EventCardProps {
  event: ActivityLogWithUser;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  const badge = getActionBadgeStyle(event.action);

  return (
    <div
      onClick={() => onSelect(event.id)}
      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
        isSelected
          ? "bg-blue-50/40 border-blue-500 shadow-xs ring-1 ring-blue-400/30"
          : "bg-white border-gray-100/90 hover:border-gray-200 hover:shadow-2xs"
      }`}
    >
      {/* الشريط العلوي: الوقت والشارة */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span dir="ltr">{formatTimeOnly(event.createdAt)}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {badge.label}
        </span>
      </div>

      {/* عنوان الحدث */}
      <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-3 line-clamp-2 leading-relaxed">
        {event.action}
      </h4>

      {/* الشريط السفلي: اسم المنفذ والتاريخ */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-50/80">
        <div className="flex items-center gap-1.5 truncate max-w-[60%]">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-slate-600" />
          </div>
          <span className="truncate font-semibold text-gray-700">
            {event.user?.name || "مستخدم غير معرف"}
          </span>
        </div>
        <span className="text-gray-400">
          {formatArabicDate(event.createdAt)}
        </span>
      </div>
    </div>
  );
}
