export class Queue<T> {
  private items: Record<number, T> = {};
  private head: number = 0;
  private tail: number = 0;

  /**
   * إضافة عنصر جديد إلى نهاية الطابور O(1)
   */
  public enqueue(element: T): void {
    this.items[this.tail] = element;
    this.tail++;
  }

  /**
   * إزالة وإرجاع أول عنصر في مقدمة الطابور O(1)
   */
  public dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  /**
   * معاينة العنصر الأول دون حذفه O(1)
   */
  public peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.head];
  }

  /**
   * فحص ما إذا كان الطابور فارغاً O(1)
   */
  public isEmpty(): boolean {
    return this.getSize() === 0;
  }

  /**
   * استرجاع عدد العناصر الحالية في الطابور O(1)
   */
  public getSize(): number {
    return this.tail - this.head;
  }

  /**
   * تفريغ الطابور بالكامل O(1)
   */
  public clear(): void {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  /**
   * تحويل محتويات الطابور إلى مصفوفة مرتبة
   */
  public toArray(): T[] {
    const result: T[] = [];
    for (let i = this.head; i < this.tail; i++) {
      result.push(this.items[i]);
    }
    return result;
  }
}
