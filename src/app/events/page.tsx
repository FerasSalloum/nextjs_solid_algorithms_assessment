"use client";

import React, { useState } from "react";
import { Search, Activity } from "lucide-react";
import { EventTimelineList } from "@src/components/events/EventTimelineList";
import { EventDetailView } from "@src/components/events/EventDetailView";

export default function EventsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="min-h-screen bg-slate-100/60 p-4 sm:p-6 lg:p-8 rtl text-right">
      <main className="max-w-7xl mx-auto space-y-4">
        {/* 1. الشريط العلوي: العنوان وشريط البحث */}
        <header className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-900">
                سجل التدقيق البرمجي والأحداث الحية
              </h1>
            </div>
          </div>

          {/* حقل البحث */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالمُعرّف، المنفذ، المشروع، أو الكلمة..."
              className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-gray-200/80 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </header>

        {/* 2. تخطيط الشاشة الرئيسي (Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* قسم التفاصيل (اليسار) */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <EventDetailView eventId={selectedEventId} />
          </div>

          {/* قسم التسلسل الزمني والقائمة اللانهائية (اليمين) */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
            <EventTimelineList
              selectedId={selectedEventId}
              onSelectEvent={(id) => setSelectedEventId(id)}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
