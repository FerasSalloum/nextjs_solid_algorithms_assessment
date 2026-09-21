import React, { forwardRef, InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, id, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            id={id}
            ref={ref}
            className={`w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : ""
            } ${className}`}
            {...props}
          />
          {Icon && (
            <Icon className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
