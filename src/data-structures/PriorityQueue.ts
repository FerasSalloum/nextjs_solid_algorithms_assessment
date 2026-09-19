import { Task, Priority } from "@prisma/client";

// خريطة تحويل أولوية Prisma إلى أوزان رقمية للمقارنة
export const PRIORITY_WEIGHTS: Record<Priority | string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export interface PriorityNode<T> {
  element: T;
  priority: number;
}

export class PriorityQueue<T = Task> {
  private heap: PriorityNode<T>[] = [];

  /**
   * إدراج عنصر مع تحديد الأولوية بشكل عددي صريح O(log n)
   */
  public enqueue(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * إدراج مهمة مباشرة مع استخراج أولويتها تلقائياً من حقل task.priority
   */
  public enqueueTask(task: Task): void {
    const weight = PRIORITY_WEIGHTS[task.priority] ?? 1;
    this.enqueue(task as unknown as T, weight);
  }

  /**
   * استخراج المهمة ذات الأولوية الأعلى O(log n)
   */
  public dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    const top = this.heap[0];
    const bottom = this.heap.pop();

    if (this.heap.length > 0 && bottom) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }

    return top.element;
  }

  /**
   * تفريغ الكومة وإعادة جميع المهام مرتبة تنازلياً حسب الأولوية O(n log n)
   */
  public drainToSortedArray(): T[] {
    const sorted: T[] = [];
    while (!this.isEmpty()) {
      const item = this.dequeue();
      if (item) sorted.push(item);
    }
    return sorted;
  }

  /**
   * دالة ساكنة تستقبل مصفوفة مهام وترجعها مرتبة فوراً (CRITICAL -> LOW)
   */
  public static sortTasksByPriority(tasks: Task[]): Task[] {
    const pq = new PriorityQueue<Task>();
    for (const task of tasks) {
      pq.enqueueTask(task);
    }
    return pq.drainToSortedArray();
  }

  public peek(): T | undefined {
    return this.isEmpty() ? undefined : this.heap[0].element;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public getSize(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority <= this.heap[parentIndex].priority) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let highest = index;
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;

      if (leftIndex < length && this.heap[leftIndex].priority > this.heap[highest].priority) {
        highest = leftIndex;
      }
      if (rightIndex < length && this.heap[rightIndex].priority > this.heap[highest].priority) {
        highest = rightIndex;
      }
      if (highest === index) break;

      this.swap(index, highest);
      index = highest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}