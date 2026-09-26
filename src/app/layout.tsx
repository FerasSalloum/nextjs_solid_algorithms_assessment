import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "مدير المشاريع", 
    template: "%s | مدير المشاريع", 
  },
  description: "المنصة الموحدة لإدارة المشاريع والمهام المؤسسية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Header />
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          dir="rtl"
        />
        <Footer/>
        </SessionProvider>  
      </body>
    </html>
  );
}
