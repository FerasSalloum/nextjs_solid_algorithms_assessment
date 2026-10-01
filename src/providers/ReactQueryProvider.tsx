"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  // استخدام useState لضمان إنشاء نسخة واحدة من QueryClient وعدم إعادة إنشائها عند Re-render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // البيانات تعتبر جديدة لمدة 5 دقائق
            refetchOnWindowFocus: false, // عدم إعادة الجلب التلقائي عند التبديل بين النوافذ (اختياري)
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
