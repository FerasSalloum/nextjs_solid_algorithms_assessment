"use client"
import { useQuery,} from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { UserWithAll } from "@/src/types/UserWithAll";
import { TaskCard } from "@/src/components/task/TaskCard";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/src/components/auth/ProfileForm";
const fetchUserProfile = async (id?: string): Promise<UserWithAll> => {
  if (!id) throw new Error("معرف المستخدم غير متوفر");
  const response = await axios.get(`/api/users/${id}`);
  return response.data.data;
};
export default function UserProfilePage() {
  const { data: session, status: sessionStatus } = useSession();

  // استخراج المعرف من الجلسة بأمان
  const userId = (session?.user as UserWithAll)?.id;

  // 1. استخدام React Query لجلب بيانات الملف الشخصي والمهام
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError,
  } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId, // لا يتم تشغيل الاستعلام إلا عند توفر معرف المستخدم
    staleTime: 1000 * 60 * 5, // الكاش طازج لمدة 5 دقائق
  });

  const router = useRouter();

  // 2. استخدام React Query Mutation لتحديث البيانات

  // معالجة حالة التحميل للجلسة أو استعلام البيانات
  if (sessionStatus === "loading" || (isProfileLoading && !!userId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center rtl">
        <div className="text-gray-500 font-bold text-sm bg-white p-8 rounded-2xl shadow-xs border border-gray-100">
          جاري تحميل بيانات الملف الشخصي...
        </div>
      </div>
    );
  }

  // معالجة حالة عدم وجود جلسة نشطة
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center rtl">
        <div className="text-amber-600 font-bold text-sm bg-white p-8 rounded-2xl shadow-xs border border-amber-100">
          يرجى تسجيل الدخول للوصول إلى هذه الصفحة.
        </div>
      </div>
    );
  }

  // معالجة حالة وجود خطأ
  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center rtl">
        <div className="text-rose-600 font-bold text-sm bg-white p-8 rounded-2xl shadow-xs border border-rose-100">
          حدث خطأ أثناء جلب بيانات الملف الشخصي.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8 rtl text-right">
      <main className="max-w-3xl mx-auto space-y-5">
        {/* ================= 1. بطاقة معلومات المستخدم والإحصائيات ================= */}
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100/80">
          <div className="text-center sm:text-right mb-6 p-440">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1.5">
              {profile.name || "NAME"}
            </h1>
            <span className="inline-block bg-slate-100 text-gray-900 px-3 py-1 rounded-md text-xs font-bold">
              {profile.role || "ROLE"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5">
                  <span className="text-blue-600">📋</span> مهام أنشئت
                </p>
                <p className="text-lg font-black text-gray-900">
                  {profile.createdTasks.length}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    مهمة
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5">
                  <span className="text-blue-600">📂</span> مشاريع أنشئت
                </p>
                <p className="text-lg font-black text-gray-900">
                  {profile.projects.length}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    مشاريع
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5">
                  <span className="text-blue-600">📝</span> مهام أُسندت
                </p>
                <p className="text-lg font-black text-gray-900">
                  {profile.tasksAssignee.length}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    مهمة
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 2. قسم المهام المسندة إلي ================= */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 px-1">
            <span className="text-blue-600 text-lg">📑</span> المهام المسندة إلي
          </h2>

          <div className="space-y-3">
            {profile.tasksAssignee?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={task.projectId}
                onViewProject={(taskId) => router.push(`/tasks/${taskId}`)}
              />
            ))}
          </div>
        </section>

        {/* ================= 3. قسم تعديل بيانات الحساب ================= */}
       
        <ProfileForm key={profile.id} profile={profile} userId={userId} />
      </main>
    </div>
  );
}
