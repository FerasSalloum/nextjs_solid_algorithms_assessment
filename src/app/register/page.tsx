import { Metadata } from "next";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import RegisterForm from "@/src/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد",
  description: "انضم إلى منصة إدارة المشاريع والمهام المصممة لفرق العمل",
};

export default function RegisterPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#0F172A]"
    >
      {/* الشعار العلوي (تمت إزالة بادجة "مؤسسي") */}
      <div className="flex items-center gap-3 mt-4 mb-10">
        <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <FolderKanban className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
          مدير المشاريع
        </span>
      </div>

      {/* نموذج إنشاء الحساب المعزول */}
      <div className="w-full max-w-md my-auto">
        <RegisterForm />
      </div>

      {/* التذييل للربط بصفحة الدخول */}
      <div className="text-center space-y-3 mt-6">
        <p className="text-sm text-slate-600">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="text-[#2563EB] font-semibold hover:underline transition-all"
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}