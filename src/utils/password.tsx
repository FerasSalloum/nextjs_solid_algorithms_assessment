export interface PasswordStrengthResult {
  score: number;
  label: string;
  color: string;
  textColor: string;
}

export const getPasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) {
    return {
      score: 0,
      label: "غير محدد",
      color: "bg-slate-200",
      textColor: "text-slate-400",
    };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;

  switch (score) {
    case 1:
      return { score: 25, label: "ضعيفة جداً", color: "bg-red-500", textColor: "text-red-500" };
    case 2:
      return { score: 50, label: "ضعيفة", color: "bg-orange-500", textColor: "text-orange-500" };
    case 3:
      return { score: 75, label: "متوسطة", color: "bg-yellow-500", textColor: "text-yellow-600" };
    case 4:
      return { score: 100, label: "قوية", color: "bg-emerald-500", textColor: "text-emerald-600" };
    default:
      return { score: 0, label: "غير محدد", color: "bg-slate-200", textColor: "text-slate-400" };
  }
};