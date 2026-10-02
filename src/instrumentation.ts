export async function register() {
  // ضمان تشغيل المستمعات في بيئة السيرفر (Node.js) فقط
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerActivityListeners } = await import(
      "@/src/infrastructure/listeners/ActivityLogListener" // عدّل المسار بما يطابق موقع ملفك
    );
    registerActivityListeners();
  }
}
