"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "../ui/Button";

interface EditCommentModalProps {
  commentId: string;
  initialContent: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCommentModal({
  commentId,
  initialContent,
  isOpen,
  onClose,
  onSuccess,
}: EditCommentModalProps) {
  const [content, setContent] = useState(initialContent || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // مزامنة محتوى التعليق عند فتح المودال أو تغير النص الابتدائي
  if (!isOpen) return null;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      await axios.patch(`/api/coments/${commentId}`, { content });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "حدث خطأ أثناء تعديل التعليق");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // الخلفية الضبابية والمنبثقة الشفافة مع التركيز في المنتصف
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 rtl text-right">
      {/* بطاقة النافذة المنبثقة المطابقة للتصميم */}
      <div className="bg-white rounded-4xl max-w-xl w-full p-8 shadow-2xl relative border border-gray-100">
        {/* زر الإغلاق الأنيق في الزاوية */}
        <button
          onClick={onClose}
          type="button"
          className="absolute left-6 top-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
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
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* عنوان النافذة */}
        <h2 className="text-lg font-black text-gray-900 mb-5">تعديل تعليق</h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* حقل إدخال النص */}
          <div className="relative">
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="...أدخل الملاحظات، الروابط الفنية، أو تنبيهات المطورين هنا"
              className="w-full p-4 bg-gray-50/60 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all resize-none"
              required
            />
          </div>

          {/* زر التعديل والحفظ بنفس لون وشكل الصورة المرفقة */}
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? <span>جاري الحفظ...</span> : <span>حفظ التعديلات</span>}
          </Button>
        </form>
      </div>
    </div>
  );
}
