"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // 1. إضافة استيراد zodResolver
import { loginSchema, LoginInput } from "@/src/validators/auth.schema"; // 2. استيراد السكيما والنوع المصدرين جاهزاً
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/src/components/ui/Input";
import { PasswordInput } from "@/src/components/ui/PasswordInput";
import { Button } from "@/src/components/ui/Button";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema), // 3. تمرير zodResolver بالشكل الصحيح
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        toast.success("تم تسجيل الدخول بنجاح! جاري التوجيه...");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          تسجيل الدخول إلى حسابك المؤسسي
        </h1>
        <p className="mt-2 text-sm text-slate-500 font-normal">
          أهلاً بك مجدداً في المنصة الموحدة لإدارة المشاريع والمهام
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="email"
          type="email"
          label="البريد الإلكتروني المؤسسي"
          placeholder="name@company.com"
          icon={Mail}
          dir="ltr"
          className="text-left"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordInput
          id="password"
          label="كلمة المرور"
          placeholder="••••••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="جاري تسجيل الدخول..."
        >
          <span>تسجيل الدخول</span>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
