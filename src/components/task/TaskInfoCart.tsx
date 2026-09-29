"use client";

import { Task } from "@prisma/client";

const TaskInfoCart = ({
  taskinfo,
}: {
  taskinfo: Task;
}) => {
  return (
    <>
      {/* شارات الحالة والأولوية */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 text-gray-900`}
        >
          {taskinfo?.status}
        </span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 text-gray-900`}
        >
          {taskinfo?.priority}
        </span>
      </div>

      {/* عنوان المهمة */}
      <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mb-3">
        {taskinfo?.title}
      </h1>

      {/* وصف المهمة */}
      {taskinfo?.description && (
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5 font-normal">
          {taskinfo.description}
        </p>
      )}

      {/* صندوق تفاصيل موعد التسليم والساعات المقدرة */}
      <div className="bg-gray-50/80 rounded-2xl p-4 grid grid-cols-2 gap-3 border border-gray-100/60 mb-5">
        {/* موعد التسليم */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-2xs border border-gray-100">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-gray-400">
              موعد التسليم
            </span>
            <span className="text-xs sm:text-sm font-black text-gray-900">
              {taskinfo?.dueDate
                ? new Date(taskinfo.dueDate).toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "غير محدد"}
            </span>
          </div>
        </div>

        {/* الساعات المقدرة */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-2xs border border-gray-100">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-gray-400">
              الساعات المقدرة
            </span>
            <span className="text-xs sm:text-sm font-black text-gray-900">
              {taskinfo?.estimatedHours
                ? `${taskinfo.estimatedHours} ساعة`
                : "غير حدد"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskInfoCart;
