import { FolderKanban } from "lucide-react";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm py-2.5 px-4 sm:px-8 rtl text-right">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* المنتصف: أزرار التنقل (تتغير ألوانها تلقائياً حسب الصفحة) */}
        <nav className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          <NavLink href="/profile">
            <span>الصفحة الشخصية</span>
          </NavLink>

          <NavLink href="/events">
            <span>صفحة الأحداث</span>
          </NavLink>

          <NavLink href="/">
            <span>الصفحة الرئيسية</span>
          </NavLink>
        </nav>

        {/* الجانب الأيسر */}
        <div className="flex items-center gap-3">
          <div className="text-left hidden md:block">
            <h2 className="text-sm font-bold text-gray-900 leading-tight">
              مدير المشاريع
            </h2>
            
          </div>
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
