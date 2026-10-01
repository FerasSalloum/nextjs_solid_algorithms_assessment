"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { UserWithAll } from "@/src/types/UserWithAll";
import { Role } from "@prisma/client";

export interface UpdateProfileInput {
  id: string;
  email: string;
  name: string;
  password?: string;
  organizationRole: string;
}

interface ProfileFormProps {
  profile: UserWithAll;
  userId: string;
}

// === دالة التحديث عبر Axios ===
const updateUserProfile = async (updatedData: UpdateProfileInput) => {
  const response = await axios.patch(
    `/api/users/${updatedData.id}`,
    updatedData,
  );
  return response.data;
};

// === المكون الفرعي ProfileForm ===
export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // 1. تهيئة الـ State مباشرة من الـ Props عند الـ Mount
  const [email, setEmail] = useState(profile.email || "");
  const [username, setUsername] = useState(profile.name || "");
  const [password, setPassword] = useState("");
  const [organizationRole, setOrganizationRole] = useState(
    profile.role || "MEMBER",
  );

  // حالات الواجهة المحلية
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 2. إعداد React Query Mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      // إبطال الكاش الخاص باستعلام بيانات الملف الشخصي
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });

      // تحديث بيانات مكونات خادم Next.js إن وجِدت
      router.refresh();

      // مسح كلمة المرور وضبط التنبيهات
      setPassword("");
      setErrorMessage("");
      setSuccessMessage("تم حفظ التعديلات بنجاح!");

      // إخفاء رسالة النجاح بعد 4 ثوانٍ
      setTimeout(() => setSuccessMessage(""), 4000);
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      setSuccessMessage("");
      const serverError =
        error.response?.data?.error ||
        "حدث خطأ أثناء حفظ التعديلات، يرجى المحاولة لاحقاً.";
      setErrorMessage(serverError);
    },
  });

  // 3. معالجة إرسال النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    updateProfileMutation.mutate({
      id: userId,
      email: email.trim(),
      name: username.trim(),
      ...(password ? { password } : {}),
      organizationRole,
    });
  };

  return (
    <section className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100/80">
      <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
        <span className="text-blue-600 text-lg"></span> تعديل بيانات الحساب
      </h2>

      {/* تنبيه النجاح */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all">
          {successMessage}
        </div>
      )}

      {/* تنبيه الخطأ */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* البريد الإلكتروني */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            البريد الإلكتروني المؤسسي
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dir-ltr text-right"
            required
          />
        </div>

        {/* اسم المستخدم */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
             اسم المستخدم
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dir-ltr text-right"
            required
          />
        </div>

        {/* كلمة المرور */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
         كلمة المرور الجديدة (اختياري)
          </label>
          <div className="relative">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="اتركها فارغة إذا لم ترد تغييرها"
              className="w-full p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* مستوى الصلاحيات */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            مستوى الصلاحيات المؤسسية
          </label>
          <select
            value={organizationRole}
            onChange={(e) => setOrganizationRole(e.target.value as Role)}
            className="w-full p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value={Role.ADMIN}>
              مدير النظام ومسؤول البنية التحتية (كامل الصلاحيات)
            </option>
            <option value={Role.MANAGER}>مدير مشاريع</option>
            <option value={Role.MEMBER}>عضو فريق</option>
          </select>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>
    </section>
  );
}
