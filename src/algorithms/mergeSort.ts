import { Task } from "@prisma/client";

// 1. تعريف نوع دالة المقارنة العمومية
export type Comparator<T> = (a: T, b: T) => number;

export function mergeSort<T>(items: T[], comparator: Comparator<T>): T[] {
  if (items.length <= 1) {
    return items;
  }

  // 1. حساب نقطة المنتصف وتقسيم المصفوفة لنصفين
  const mid = Math.floor(items.length / 2);
  const leftHalf = items.slice(0, mid);
  const rightHalf = items.slice(mid);

  // 2. الفرز التناودي لكل نصف بشكل منفصل
  const sortedLeft = mergeSort(leftHalf, comparator);
  const sortedRight = mergeSort(rightHalf, comparator);

  // 3. دمج النصفين المرتبين وإرجاع النتيجة
  return merge(sortedLeft, sortedRight, comparator);
}

/**
 * دالة مساعدة لدمج مصفوفتين مرتبتين في مصفوفة واحدة
 */
function merge<T>(left: T[], right: T[], comparator: Comparator<T>): T[] {
  const result: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  // المقارنة بين عنصري المقدمة في المصفوفتين وإضافة الأنسب بناءً على الـ comparator
  while (leftIndex < left.length && rightIndex < right.length) {
    if (comparator(left[leftIndex], right[rightIndex]) <= 0) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  // دمج ما تبقى من العناصر في الأطراف (إن وُجدت)
  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

/**
 * دالة مقارنة مخصصة لفرز كائنات Task بناءً على تاريخ الإنشاء createdAt
 * @param order 'desc' للترتيب من الأحدث للأقدم | 'asc' من الأقدم للأحدث
 */
export function compareTaskByCreatedAt(
  order: "asc" | "desc" = "desc",
): Comparator<Task> {
  return (a: Task, b: Task) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    return order === "asc" ? timeA - timeB : timeB - timeA;
  };
}

// // 2. فرز المهام من الأحدث إلى الأقدم (descending)
// const newestTasksFirst = mergeSort(rawTasks, compareTaskByCreatedAt("desc"));

// // 3. فرز المهام من الأقدم إلى الأحدث (ascending)
// const oldestTasksFirst = mergeSort(rawTasks, compareTaskByCreatedAt("asc"));
