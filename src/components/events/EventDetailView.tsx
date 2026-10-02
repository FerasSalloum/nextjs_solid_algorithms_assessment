"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ActivityLogWithUserProjectTask } from "@/src/types/ActivityLog";
import { EventMetadataGrid } from "./EventMetadataGrid";
import { EventPayloadViewer } from "./EventPayloadViewer";
import { ShieldAlert, Loader2 } from "lucide-react";
import { ActivityLog } from "@prisma/client";

interface EventDetailViewProps {
  eventId: string | null;
}

const fetchEventById = async (
  id: string,
): Promise<ActivityLogWithUserProjectTask> => {
  const response = await axios.get(`/api/events/${id}`);
  return response.data.data;
};

export function EventDetailView({ eventId }: EventDetailViewProps) {
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event-detail", eventId],
    queryFn: () => fetchEventById(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  });

  if (!eventId) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100/90 p-8 shadow-xs h-195 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-700 mb-1">
          لم يتم تحديد أي حدث
        </h3>
        <p className="text-xs text-gray-400 max-w-xs">
          اختر حدثاً من قائمة التسلسل الزمني على اليمين لاستعراض تفاصيله وحمولة
          البيانات الخاصة به.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100/90 p-8 shadow-xs h-195 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-bold text-gray-500">
          جاري تحميل تفاصيل الحدث...
        </p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100/90 p-8 shadow-xs h-195 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-bold text-rose-500">
          حدث خطأ أثناء تحميل تفاصيل هذا الحدث.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs p-6 h-195 overflow-y-auto space-y-4 text-right">
      {/* عنوان الحدث الرئيسي */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 leading-snug">
          {event.action}
        </h2>
      </div>

      {/* شبكة البيانات الوصفية */}
      <EventMetadataGrid event={event} />

      {/* عارض JSON Terminal */}
      <EventPayloadViewer payload={event} />
    </div>
  );
}
