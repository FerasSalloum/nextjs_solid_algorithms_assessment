import { Metadata } from "next";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import LoginForm from "@/src/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "تسجيل الدخول إلى المنصة الموحدة لإدارة المشاريع والمهام",
};

export default function LoginPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#0F172A]"
    >
      {/* 1. الشعار العلوي */}
      <div className="flex items-center gap-3 mt-4 mb-10">
        <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <FolderKanban className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
          مدير المشاريع
        </span>
      </div>

      {/* 2. استدعاء النموذج التفاعلي المعزول */}
      <div className="w-full max-w-md my-auto">
        <LoginForm />
      </div>

      {/* 3. التذييل والروابط السفلية */}
      <div className="text-center space-y-3 mt-4">
        <p className="text-sm text-slate-600">
          ليس لديك حساب مؤسسي؟{" "}
          <Link
            href="/register"
            className="text-[#2563EB] font-semibold hover:underline transition-all"
          >
            طلب إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
}
