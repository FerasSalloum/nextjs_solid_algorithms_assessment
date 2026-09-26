import { NavLink } from "@/src/components/ui/NavLink";
import { FolderKanban } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-4 px-4 sm:px-8 rtl text-right mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        {/* الجانب الأيمن (في RTL): الشعار والعنوان والإصدار */}
        <div className="flex items-center gap-3">
          {/* مربع الأيقونة الداكن */}
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <span className="font-bold text-gray-900">مدير المشاريع المؤسسي</span>
        </div>

        {/* المنتصف: روابط الصفحات باستخدام كمبوننت NavLink */}
        <nav className="flex items-center gap-1 sm:gap-3 my-2 md:my-0">
          <NavLink href="/profile">
            <span>الصفحة الشخصية</span>
          </NavLink>

          <NavLink href="/events">
            <span>صفحة الاحداث</span>
          </NavLink>

          <NavLink href="/">
            <span>الصفحة الرئيسية</span>
          </NavLink>
        </nav>

        {/* الجانب الأيسر (في RTL): حقوق النشر */}
        <div className="text-gray-400 text-xs text-center md:text-left font-normal">
          جميع الحقوق محفوظة © 2026 مدير المشاريع
        </div>
      </div>
    </footer>
  );
}
