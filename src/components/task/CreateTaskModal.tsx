"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../ui/Button";
import { User } from "@prisma/client";

interface UserOption {
  id: string;
  name: string;
  role: string;
  initials?: string;
  color?: string;
}

interface CreateTaskModalProps {
  projectId: string;
  projectName?: string;
  projectCode?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { id: "TODO", dot: "bg-gray-400" },
  { id: " IN_PROGRESS", dot: "bg-blue-500" },
  { id: "IN_REVIEW", dot: "bg-amber-500" },
  { id: "DONE", dot: "bg-emerald-500" },
  { id: "CANCELLED", dot: "bg-rose-500" },
];

const PRIORITY_OPTIONS = [
  {
    id: "LOW",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    id: "MEDIUM",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    id: "HIGH",
    color: "text-amber-600 bg-amber-50 border-amber-300",
    dot: "bg-amber-500",
  },
  {
    id: "CRITICAL",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
  },
];

export function CreateTaskModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [priority, setPriority] = useState("HIGH");
  const [dueDate, setDueDate] = useState("2026-05-15");
  const [estimatedHours, setEstimatedHours] = useState<number | "">(16);

  // حالة قائمة الأعضاء والتحميل من الـ API
  const [users, setUsers] = useState<UserOption[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // حالة اختيار وتصفية الأعضاء
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string>("");
  const [searchAssignee, setSearchAssignee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // جلب قائمة الأعضاء (MEMBER) من الـ API عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        setFetchingUsers(true);
        try {
          const response = await axios.get("/api/users?role=MEMBER");
          if (response.data?.success && Array.isArray(response.data.data)) {
            const mappedUsers: UserOption[] = response.data.data.map((u: User) => ({
              id: u.id,
              name: u.name || u.email || "عضو فريق",
              role: u.role || "MEMBER",
              initials: u.name ? u.name.substring(0, 2) : "ع.ف",
              color: "bg-blue-100 text-blue-700",
            }));
            setUsers(mappedUsers);
          }
        } catch (err) {
          console.error("خطأ أثناء جلب قائمة الأعضاء:", err);
        } finally {
          setFetchingUsers(false);
        }
      };

      fetchMembers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds(userId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`/api/projects/${projectId}/tasks`, {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimatedHours: Number(estimatedHours) || undefined,
        assigneeIds: selectedAssigneeIds,
      });

      // إعادة ضبط النموذج
      setTitle("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "حدث خطأ أثناء إضافة المهمة");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchAssignee.toLowerCase()) ||
      u.role.toLowerCase().includes(searchAssignee.toLowerCase()),
  );

  const selectedUsers = users.filter((u) =>
    selectedAssigneeIds.includes(u.id),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 rtl text-right">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
        {/* الهيدر وزر الإغلاق */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              إنشاء مهمة جديدة
            </h2>
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

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* عنوان ووصف المهمة */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              عنوان المهمة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بناء وتدوين بيئة التدفق المستمر عبر مستودعات CI/CD بما يتطابق مع التوثيق المعتمد"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              تفاصيل الوصف والمعايير
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="بناء وتدوين بيئة التدفق المستمر عبر مستودعات CI/CD بالتطابق مع التوثيق المعتمد..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* حالة المهمة Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              حالة المهمة (Status)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                    <span className="text-[10px] opacity-60 uppercase">
                      {opt.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* مستوى الأولوية Priority */}
          <div>
            <div className="flex flex-row-reverse justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700">
                مستوى الأولوية (Priority)
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((opt) => {
                const isSelected = priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? `${opt.color} ring-2 ring-amber-400/50 shadow-xs`
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/80 border border-gray-200">
                      {opt.id}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* التاريخ والجهد التقديري */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                تاريخ الاستحقاق والتسليم{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                الموعد النهائي لمرحلة التسليم السحابي المعتمد.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">
                  الجهد التقديري بالساعات
                </label>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span>إضافة سريعة:</span>
                  {[2, 4, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setEstimatedHours(h)}
                      className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-700"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={estimatedHours}
                  onChange={(e) =>
                    setEstimatedHours(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="ساعة"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                يتم احتساب الساعات في مؤشر طاقة Sprint.
              </p>
            </div>
          </div>

          {/* الشخص المسند إليه المهمة (فريق العمل) */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-bold text-gray-800 block">
                  الشخص المسند إليه المهمة (فريق العمل)
                </label>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {selectedAssigneeIds ? 1 : 0} عضو محدد
              </span>
            </div>

            {/* العناصر المحددة (Tags) */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedUsers.map((user) => (
                  <span
                    key={user.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs font-bold text-gray-700"
                  >
                    <span>{user.name}</span>
                    <span className="text-[10px] text-gray-400">
                      ({user.role})
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAssignee(user.id)}
                      className="text-gray-400 hover:text-rose-500 font-bold mr-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* حقل البحث */}
            <div className="relative mb-2">
              <input
                type="text"
                value={searchAssignee}
                onChange={(e) => setSearchAssignee(e.target.value)}
                placeholder="ابحث لإضافة أو تعديل الإسناد..."
                className="w-full px-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-xs">
                🔍
              </span>
            </div>

            {/* قائمة الأعضاء */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
              {fetchingUsers ? (
                <div className="text-center py-4 text-xs text-gray-500">
                  جاري تحميل قائمة الأعضاء...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">
                  لا يوجد أعضاء مطابقون
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isChecked = selectedAssigneeIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleAssignee(user.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors px-6 ${
                        isChecked
                          ? "bg-blue-50/60 border border-blue-100"
                          : "bg-white hover:bg-gray-100/80 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  );
                })
              )}
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
            <div>
              <Button type="submit" isLoading={loading} loadingText="جاري الحفظ...">
                <span>✓</span>
                <span>إنشاء المهمة وحفظها</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}