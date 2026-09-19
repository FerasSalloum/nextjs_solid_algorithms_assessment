import { Queue } from "@/src/data-structures/Queue";
import { ActivityLogService } from "@/src/application/services/ActivityLogService";
import { ActivityMetadata } from "@/src/types/ActivityMetadata";

export interface LogQueueItem {
  userId: string;
  action: string;
  projectId?: string;
  taskId?: string;
  metadata?: ActivityMetadata;
}

export class ActivityLogQueueProcessor {
  private queue = new Queue<LogQueueItem>();
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private activityLogService: ActivityLogService) {}

  /**
   * إيداع السجل في الطابور بزمن O(1) دون إعاقة الـ API
   */
  public enqueueLog(item: LogQueueItem): void {
    this.queue.enqueue(item);
  }

  /**
   * تشغيل المعالج الدائري لسحب البيانات وتفريغ الطابور في قاعدة البيانات
   */
  public startWorker(intervalMs: number = 2000, batchSize: number = 20): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      if (this.queue.isEmpty()) return;

      const batch: LogQueueItem[] = [];
      
      // سحب عناصر الدفعة بحسب أسبقية الوصول (FIFO)
      while (!this.queue.isEmpty() && batch.length < batchSize) {
        const item = this.queue.dequeue();
        if (item) batch.push(item);
      }

      if (batch.length > 0) {
        try {
          // معالجة الدفعة متوازياً تخفيفاً عن الخادم
          await Promise.all(
            batch.map((log) => this.activityLogService.logActivity(log))
          );
        } catch (error) {
          console.error("فشل معالجة دفعة سجلات الأحداث من الطابور:", error);
        }
      }
    }, intervalMs);
  }

  public stopWorker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}