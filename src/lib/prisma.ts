import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// تعريف الواجهة لتجنب مشاكل TypeScript مع globalThis
const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined 
};

/**
 * وظيفة لإنشاء نسخة Prisma Client مع دعم الـ Driver Adapter
 * هذا النمط ضروري للعمل بكفاءة في البيئات السحابية مثل Vercel
 */
const prismaClientSingleton = () => {
  // استخدام DATABASE_URL أو POSTGRES_URL (المتوفر غالباً في Vercel Postgres)
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.warn("تنبيه: لم يتم العثور على DATABASE_URL في المتغيرات البيئية.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ 
    adapter,
    // يمكنك إضافة log هنا لمراقبة الاستعلامات في بيئة التطوير
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

// تصدير نسخة واحدة فقط (Singleton)
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// في بيئة التطوير، نقوم بتخزين النسخة في الكائن العالمي لمنع إنشاء اتصالات جديدة عند كل Hot Reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}