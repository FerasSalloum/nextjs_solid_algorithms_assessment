"use client";

import React, { useState } from "react";
import { TaskCommentWithAuthor } from "@/src/types/TaskComment";
import { EditCommentModal } from "./editeComment";

interface ListCommentsProps {
  comment: TaskCommentWithAuthor;
  onCommentUpdated?: () => void; // دالة استدعاء اختيارية لإعادة جلب التعليقات في المكون الأب
}

const Listcoments = ({ comment, onCommentUpdated }: ListCommentsProps) => {
  // حالة التحكم بفتح وإغلاق مودال التعديل
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // دالة تُنفذ عند نجاح عملية التعديل
  const handleSuccess = () => {
    if (onCommentUpdated) {
      onCommentUpdated();
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div
          key={comment.id}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 transition-all hover:border-gray-200"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-gray-900">
                    {comment.author.name || "مستخدم غير معروف"}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-900`}
                  >
                    {comment.author.role}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-gray-400 block mt-0.5">
                  {new Date(comment.createdAt).toLocaleDateString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              {/* زر فتح مودال التعديل */}
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="تعديل التعليق"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line pr-13">
            {comment.content}
          </p>
        </div>
      </div>

      {/* مودال التعديل مع الخصائص المربوطة */}
      <EditCommentModal
        commentId={comment.id}
        initialContent={comment.content}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default Listcoments;