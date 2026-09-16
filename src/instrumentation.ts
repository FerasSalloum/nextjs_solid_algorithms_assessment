export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerActivityListeners } = await import(
      "@/src/infrastructure/listeners/ActivityLogListener"
    );
    
    registerActivityListeners();
  }
}