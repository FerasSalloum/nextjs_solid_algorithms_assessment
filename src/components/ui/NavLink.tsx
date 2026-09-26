"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  // التحقق مما إذا كان الرابط هو الصفحة الحالية
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
        isActive
          ? "bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs" // الألوان عند فتح الصفحة
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"            // الألوان الافتراضية
      }`}
    >
      {children}
    </Link>
  );
}