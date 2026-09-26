"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/src/components/ui/Button";

interface ErrorResponse {
  error?: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("يرجى إدخال اسم المشروع");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // إرسال الطلب بواسطة Axios
      await axios.post("/api/projects", { name, description });

      setName("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      // تغيير النوع إلى unknown بدلاً من any
      if (axios.isAxiosError<ErrorResponse>(err)) {
        // يتعرف TypeScript تلقائياً على أن err من نوع AxiosError
        setError(err.response?.data?.error || "حدث خطأ أثناء إنشاء المشروع");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rtl ">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <div className="flex items-start gap-3 mb-6 flex-row-reverse ">
          <div className="p-3 bg-gray-100 rounded-xl text-xl ">📁</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              إنشاء مشروع جديد
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              أدخل بيانات المشروع وتفاصيله للبدء في توزيع المهام وتتبع الإنجاز.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              اسم المشروع <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: بوابة الخدمات الرقمية للمؤسسة"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              تفاصيل ونطاق المشروع
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً موجزاً يحدد الأهداف العامة، الفئات المستهدفة، والمخرجات المتوقعة..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-black"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              loadingText="جاري الإنشاء..."
              className="mt-0 flex-1"
            >
              إنشاء المشروع &larr;
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              إلغاء الأمر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
