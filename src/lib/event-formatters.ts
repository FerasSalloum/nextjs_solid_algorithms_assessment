
//  تنسيق التاريخ باليوم والشهر والسنة باللغة العربية
export function formatArabicDate(dateInput: Date | string): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

 //تنسيق الوقت بالساعة والدقيقة والثانية
export function formatTimeOnly(dateInput: Date | string): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

//  تحديد مظهر ولون نوع الحدث (Badge Style)

export function getActionBadgeStyle(action: string) {
  if (action.includes("AUDIT") || action.includes("CREATE")) {
    return {
      label: "AUDIT",
      bg: "bg-blue-600/10",
      text: "text-blue-600",
      border: "border-blue-600/30",
    };
  }
  if (action.includes("UPDATE") || action.includes("EDIT")) {
    return {
      label: "UPDATE",
      bg: "bg-emerald-600/10",
      text: "text-emerald-600",
      border: "border-emerald-600/30",
    };
  }
  if (action.includes("DELETE") || action.includes("REMOVE")) {
    return {
      label: "DELETE",
      bg: "bg-rose-600/10",
      text: "text-rose-600",
      border: "border-rose-600/30",
    };
  }
  return {
    label: "SYSTEM_LOG",
    bg: "bg-slate-700/10",
    text: "text-slate-700",
    border: "border-slate-700/30",
  };
}