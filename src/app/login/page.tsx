"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  FolderKanban,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        router.push("/projects");
        router.refresh();
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#0F172A]"
    >
      {/* 1. الشعار العلوي (Header Logo) */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <FolderKanban className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
          مدير المشاريع
        </span>
      </div>

      {/* 2. بطاقة تسجيل الدخول الرئيسية (Login Card) */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 sm:p-10">
          {/* رأس البطاقة */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              تسجيل الدخول إلى حسابك المؤسسي
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-normal">
              أهلاً بك مجدداً في المنصة الموحدة لإدارة المشاريع والمهام
            </p>
          </div>

          {/* رسالة الخطأ إن وجدت */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* نموذج البيانات */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* حقل البريد الإلكتروني */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                البريد الإلكتروني المؤسسي
              </label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  dir="ltr"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-left"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                كلمة المرور
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 3. التذييل والروابط السفلية (Footer Section) */}
      <div className="text-center space-y-3 mb-2">
        <p className="text-sm text-slate-600">
          ليس لديك حساب مؤسسي؟{" "}
          <Link
            href="/register"
            className="text-[#2563EB] font-semibold hover:underline transition-all"
          >
            طلب إنشاء حساب
          </Link>
        </p>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-normal">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>
            نظام تشفير معتمد متوافق مع معايير أمن البيانات السحابية ISO 27001
          </span>
        </div>
      </div>
    </div>
  );
}
