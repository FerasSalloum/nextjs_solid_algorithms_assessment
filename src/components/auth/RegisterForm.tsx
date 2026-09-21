"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { User, Mail, ArrowLeft } from "lucide-react";
import {
  RegisterFormInput,
  registerFormSchema,
} from "@/src/validators/auth.schema";
import { Input } from "@/src/components/ui/Input";
import { PasswordInput } from "@/src/components/ui/PasswordInput";
import { Button } from "@/src/components/ui/Button";
import { getPasswordStrength } from "@/src/utils/password";

const FORM_FIELDS: Array<keyof RegisterFormInput> = [
  "name",
  "email",
  "password",
  "confirmPassword",
];

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // مراقبة كلمة المرور بأسلوب متوافق مع React Compiler
  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormInput) => {
    try {
      const response = await axios.post("/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // أي استجابة ناجحة (200 أو 201) تُعتبر نجاحاً
      toast.success(response.data.message || "تم إنشاء الحساب بنجاح!");
      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const { error: generalError, details } = error.response.data || {};

        // 1. معالجة أخطاء الحقول وتوجيهها للحقل الصحيح بأمان
        if (details && typeof details === "object") {
          Object.entries(details).forEach(([field, messages]) => {
            const fieldKey = field as keyof RegisterFormInput;
            if (
              FORM_FIELDS.includes(fieldKey) &&
              Array.isArray(messages) &&
              messages.length > 0
            ) {
              setError(fieldKey, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }

        // 2. إظهار الإشعار العام
        if (generalError) {
          toast.error(generalError);
        } else if (!details) {
          toast.error("حدث خطأ غير متوقع أثناء إنشاء الحساب");
        }
      } else {
        toast.error("حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          إنشاء حساب جديد
        </h1>
        <p className="mt-2 text-sm text-slate-500 font-normal">
          انضم إلى منصة إدارة المشاريع والمهام
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* الاسم الكامل */}
        <Input
          id="name"
          type="text"
          label="الاسم الكامل"
          placeholder="مثال: د. عمر العتيبي أو م. سارة القحطاني"
          icon={User}
          error={errors.name?.message}
          {...register("name")}
        />

        {/* البريد الإلكتروني */}
        <Input
          id="email"
          type="email"
          label="البريد الإلكتروني"
          placeholder="name@company.com"
          icon={Mail}
          dir="ltr"
          className="text-left"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* كلمة المرور */}
        <div>
          <PasswordInput
            id="password"
            label="كلمة المرور"
            placeholder="••••••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          {/* مؤشر قوة كلمة المرور مع دعم Accessibility */}
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">
                قوة كلمة المرور:
              </span>
              <span className={`font-semibold ${strength.textColor}`}>
                {strength.label}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="قوة كلمة المرور"
              aria-valuenow={strength.score}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* تأكيد كلمة المرور */}
        <PasswordInput
          id="confirmPassword"
          label="تأكيد كلمة المرور"
          placeholder="••••••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* زر الإرسال */}
        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="جاري إنشاء الحساب..."
        >
          <span>إنشاء الحساب والمتابعة</span>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
