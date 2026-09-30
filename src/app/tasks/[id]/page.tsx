"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Task } from "@prisma/client";
import TaskInfoCart from "@/src/components/task/TaskInfoCart";
import Listcoments from "@/src/components/coments/Listcoments";
import { TaskCommentWithAuthor } from "@/src/types/TaskComment";
import { Button } from "@/src/components/ui/Button";
import { EdetTaskModal } from "@/src/components/task/EdetTaskModal";

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // حالات التعليقات
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<TaskCommentWithAuthor[]>([]);

  // مؤشر لإعادة تشغيل useEffect عند إضافة تعليق جديد أو تحديث المهمة
  const [refreshKey, setRefreshKey] = useState(0);

  // ==========================================
  // 1. دالة إرسال تعليق جديد
  // ==========================================
  const handleSubmitComment = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await axios.post(`/api/tasks/${taskId}/comments`, {
        content: newComment,
      });

      // تغيير قيمة المؤشر لإجبار useEffect على الجلب من جديد بأمان
      setRefreshKey((prev) => prev + 1);
      setNewComment("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "حدث خطأ أثناء إضافة التعليق");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // ==========================================
  // 2. جلب تفاصيل المهمة والتعليقات عند فتح الصفحة أو عند تغير refreshKey
  // ==========================================
  useEffect(() => {
    if (!taskId) return;

    let isMounted = true;

    const fetchPageData = async () => {
      try {
        const [taskRes, commentsRes] = await Promise.all([
          axios.get(`/api/tasks/${taskId}`),
          axios.get(`/api/tasks/${taskId}/comments`),
        ]);

        if (isMounted) {
          setTask(taskRes.data.data || taskRes.data);
          setComments(commentsRes.data.data || commentsRes.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.error || "حدث خطأ أثناء جلب بيانات المهمة",
            );
          } else {
            setError("تعذر الاتصال بالخادم");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPageData();

    return () => {
      isMounted = false;
    };
  }, [taskId, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-sm font-bold text-gray-500 animate-pulse">
          جاري تحميل تفاصيل المهمة...
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100">
          {error || "المهمة غير موجودة"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50/50 via-slate-50 to-blue-50/30 p-4 sm:p-6 md:p-8 rtl text-right font-sans">
      <div className="max-w-xl mx-auto space-y-5">
        {/* ترويسة المهمة مع دالة تحديث آمنة عند النجاح */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80">
          <TaskInfoCart taskinfo={task} />

          {/* زر تعديل المهمة */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200/80 text-gray-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200/50 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>تعديل المهمة</span>
          </button>
          <EdetTaskModal
            task={task}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => setRefreshKey((prev) => prev + 1)}
          />
        </div>
        {/* عنوان قسم التعليقات */}
        <div className="flex items-center gap-2 pt-2 px-1">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 className="text-base font-black text-gray-900">
            التعليقات ({comments?.length || 0})
          </h2>
        </div>

        {/* قائمة التعليقات في حاوية تمرير مستقلة */}
        <div className="max-h-120 overflow-y-auto space-y-4 p-4 focus:outline-none">
          {comments.map((comment) => (
            <Listcoments
              key={comment.id}
              comment={comment}
              onCommentUpdated={() => setRefreshKey((prev) => prev + 1)}
            />
          ))}
        </div>

        {/* نموذج إضافة تعليق */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/80">
          <h3 className="text-sm font-black text-gray-900 mb-3">إضافة تعليق</h3>

          <form onSubmit={handleSubmitComment} className="space-y-4">
            <textarea
              rows={3}
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="أدخل الملاحظات، الروابط الفنية، أو تنبيهات المطورين هنا..."
              className="w-full p-4 bg-gray-50/80 border border-gray-200/70 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium transition-all"
            />

            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
              >
                <span>
                  {isSubmittingComment ? "جاري الإرسال..." : "إضافة تعليق"}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
