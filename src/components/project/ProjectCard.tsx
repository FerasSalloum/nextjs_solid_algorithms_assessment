"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { calculateProjectAnalytics } from "@/src/algorithms/projectAnalyticsCalculator";
import { ProjectWithOwnerTask } from "@/src/types/ProjectRepository";

interface ProjectCardProps {
  project: ProjectWithOwnerTask;
  onViewProject?: (id: string) => void;
}

export function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    remainingTasks: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function computeStats() {
      setLoading(true);
      // استدعاء الـ Server Action
      const result = await calculateProjectAnalytics(project.tasks || []);
      setAnalytics(result);
      setLoading(false);
    }
    computeStats();
  }, [project.tasks]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 rtl">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{project.name}</h3>
        <p className="text-xs text-gray-500">
          المنشئ: {project.owner?.name || "غير محدد"}
        </p>
      </div>

      <div className="bg-gray-50/60 rounded-xl p-3 grid grid-cols-3 text-center mb-4 border border-gray-100">
        <div>
          <p className="text-base font-bold text-gray-900">
            {loading ? "-" : analytics.totalTasks}
          </p>
          <p className="text-[11px] text-gray-500">المهام الكلية</p>
        </div>
        <div className="border-r border-l border-gray-200">
          <p className="text-base font-bold text-emerald-600">
            {loading ? "-" : analytics.completedTasks}
          </p>
          <p className="text-[11px] text-gray-500">المنجزة</p>
        </div>
        <div>
          <p className="text-base font-bold text-gray-700">
            {loading ? "-" : analytics.remainingTasks}
          </p>
          <p className="text-[11px] text-gray-500">المتبقية</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-gray-500">مستوى الإنجاز الإجمالي</span>
          <span className="font-bold text-blue-600">
            {loading ? "..." : `${analytics.completionRate}%`}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden dir-ltr">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${analytics.completionRate}%` }}
          />
        </div>
      </div>

      <Button onClick={() => onViewProject?.(project.id)}>
        استعراض المشروع &larr;
      </Button>
    </div>
  );
}