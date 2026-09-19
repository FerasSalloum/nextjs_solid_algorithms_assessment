export type KeyValuePair<K, V> = [K, V];

export class HashTable<K extends string | number, V> {
  private buckets: KeyValuePair<K, V>[][];
  private limit: number;
  private size: number = 0;

  constructor(limit: number = 31) {
    this.limit = limit;
    // إنشاء مصفوفة من الحاويات (Buckets) لتخزين البيانات وعلاج التصادمات
    this.buckets = new Array(this.limit).fill(null).map(() => []);
  }

  /**
   * دالة التجزئة الخاصة لتحويل المفتاح إلى فهرس عددي
   */
  private hash(key: K): number {
    const stringKey = String(key);
    let hashValue = 0;
    const PRIME = 31; // عدد أولي لتقليل توزيع الأرقام المتطابقة (التصادمات)

    for (let i = 0; i < stringKey.length; i++) {
      hashValue = (hashValue * PRIME + stringKey.charCodeAt(i)) % this.limit;
    }

    return hashValue;
  }

  /**
   * إضافة عنصر جديد أو تحديث القيمة إذا كان المفتاح موجوداً مسبقاً
   */
  public set(key: K, value: V): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    // 1. التحديث في حال وجود المفتاح مسبقاً
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value;
        return;
      }
    }

    // 2. الإضافة في حال كان المفتاح جديداً
    bucket.push([key, value]);
    this.size++;
  }

  /**
   * جلب قيمة العنصر باستخدام المفتاح
   */
  public get(key: K): V | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (const [k, v] of bucket) {
      if (k === key) {
        return v;
      }
    }

    return undefined;
  }
  /**
   * دالة ساكنة لبناء جدول تجزئة فورياً من مصفوفة عناصر
   */
  public static fromArray<K extends string | number, V>(
    items: V[],
    keyExtractor: (item: V) => K,
  ): HashTable<K, V> {
    // حساب حجم مناسب للمحفظة يتناسب مع عدد العناصر لمنع التزاحم والتصادمات
    const optimalLimit = Math.max(31, items.length * 2);
    const hashTable = new HashTable<K, V>(optimalLimit);

    for (const item of items) {
      hashTable.set(keyExtractor(item), item);
    }

    return hashTable;
  }
  /**
   * حذف عنصر من جدول التجزئة
   */
  public delete(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1); // حذف الزوج من الحاوية الفرعية
        this.size--;
        return true;
      }
    }

    return false;
  }

  /**
   * استرجاع عدد العناصر الإجمالي المخزنة
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * تفريغ الجدول بالكامل
   */
  public clear(): void {
    this.buckets = new Array(this.limit).fill(null).map(() => []);
    this.size = 0;
  }
}
