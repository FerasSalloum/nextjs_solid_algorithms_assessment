"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";

export interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface EditProjectModalProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const PROJECT_STATUS_OPTIONS = ["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"];

export function EditProjectModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // إرسال طلب PATCH لتعديل المشروع في قاعدة البيانات
      await axios.patch(`/api/projects/${project.id}`, {
        name,
        description: description || undefined,
        status,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "حدث خطأ أثناء تعديل بيانات المشروع",
        );
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // إرسال طلب DELETE لحذف المشروع
      await axios.delete(`/api/projects/${project.id}`);

      if (onSuccess) onSuccess();
      if (onClose) onClose();

      // التوجيه تلقائياً إلى قائمة المشاريع وتحديث البيانات
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "حدث خطأ أثناء حذف بيانات المشروع",
        );
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 rtl text-right">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
        {/* الهيدر وزر الإغلاق */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              تعديل بيانات المشروع
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              قم بتحديث تفاصيل المشروع وحالته المعتمدة
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* عرض أخطاء الـ Validation / API */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* اسم المشروع */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              اسم المشروع <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مشروع تطوير المنصة السحابية"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* وصف المشروع */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              وصف المشروع والتفاصيل
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح مختصر لأهداف المشروع ونطاق العمل..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* حالة المشروع Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              حالة المشروع (Status)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PROJECT_STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStatus(opt)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[11px]">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* أزرار الإجراءات السفلية */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              إلغاء الأمر
            </button>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2.5 mr-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
              </button>
              <div>
                <Button
                  type="submit"
                  isLoading={loading}
                  loadingText="جاري الحفظ..."
                >
                  <span>✓</span>
                  <span>تعديل وحفظ البيانات</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
