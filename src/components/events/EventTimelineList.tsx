// src/app/events/components/EventTimelineList.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { RotateCw, Loader2 } from "lucide-react";
import { ActivityLogWithUser } from "@/src/types/ActivityLog";
import { EventCard } from "./EventCard";

interface EventTimelineListProps {
  selectedId: string | null;
  onSelectEvent: (id: string) => void;
  searchQuery?: string;
}

const fetchEventsPage = async ({
  pageParam = 1,
  search,
}: {
  pageParam?: number;
  search?: string;
}) => {
  const response = await axios.get("/api/events", {
    params: {
      page: pageParam,
      limit: 10,
      search,
    },
  });
  return response.data;
};

export function EventTimelineList({
  selectedId,
  onSelectEvent,
  searchQuery = "",
}: EventTimelineListProps) {
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["events-infinite", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      fetchEventsPage({ pageParam, search: searchQuery }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.nextPage : undefined,
  });

  // إعداد IntersectionObserver الأصلي باستخدام useRef
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // دمج كافة الأوراق/الصفحات في مصفوفة واحدة
  const allEvents: ActivityLogWithUser[] =
    data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs p-4 flex flex-col h-[780px]">
      {/* هيدر القائمة */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <h3 className="text-xs font-extrabold text-gray-800">
            التسلسل الزمني للعمليات
          </h3>
        </div>
        <button
          onClick={() => refetch()}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
          title="تحديث القائمة"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* قائمة الأحداث المعروضة */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-right">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            جاري تحميل الأحداث...
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-xs text-rose-500 font-bold">
            حدث خطأ أثناء تحميل سجل الأحداث
          </div>
        ) : allEvents.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400">
            لا توجد أحداث حية مسجلة حالياً
          </div>
        ) : (
          allEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={selectedId === event.id}
              onSelect={onSelectEvent}
            />
          ))
        )}

        {/* العنصر المرصود في نهاية القائمة لتفعيل التمرير اللانهائي */}
        <div ref={observerTargetRef} className="py-2 text-center">
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              تحميل المزيد من الأحداث...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}