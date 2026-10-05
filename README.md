# نظرة عامة على المشروع

> منصة ذكية لإدارة المشاريع والمهام — مبنية بـ Next.js مع تطبيق عملي لمبادئ SOLID وهياكل البيانات والخوارزميات

---

## 1. اسم المشروع

| البند                     | القيمة                                                       |
| ------------------------- | ------------------------------------------------------------ |
| **الاسم التقني**          | `nextjs_solid_algorithms_assessment`                         |
| **الاسم المعروض**         | **مدير المشاريع** (Smart Project & Task Management Platform) |
| **الإصدار**               | `0.1.0`                                                      |
| **النوع**                 | مشروع خاص (`private`) — تطبيق ويب كامل (Full-Stack)          |
| **الواجهة**               | عربية بالكامل باتجاه RTL، خط Geist / Geist Mono              |
| **الوصف في `layout.tsx`** | "المنصة الموحدة لإدارة المشاريع والمهام المؤسسية"            |

---

## 2. الغرض من المشروع

المشروع تطبيق ويب متكامل يتيح للمستخدمين:

- إنشاء المشاريع وإدارتها (تعديل، أرشفة، حذف، بحث، فلترة).
- إنشاء المهام وإسنادها لأعضاء الفريق مع تحديد الحالة والأولوية وتاريخ الاستحقاق.
- التعليق على المهام ومتابعة النقاشات بين الإدارة والأعضاء.
- **حساب إحصائيات وتحليلات المشروع** ونسبة الإنجاز وحالة صحة المشروع (HEALTHY / AT_RISK / CRITICAL).
- **تدقيق كامل للعمليات** عبر سجل أنشطة (Activity Log / Audit Trail) يُسجَّل تلقائياً لكل إجراء مهم.
- تسجيل الدخول والخروج وحماية المسارات وتنفيذ صلاحيات حسب الدور.

**والغرض التعليمي/التقييمي هو الأهم:** المشروع답 تم بناؤه كـ _تقييم هندسي بمستوى Senior_ (Senior Engineering Assessment) لإثبات القدرة على:

- فصل المسؤوليات (Separation of Concerns) والبنية النظيفة (Clean Architecture).
- تطبيق مبادئ SOLID **في كود فعلي** لا في تعليقات.
- اختيار واستخدام هياكل البيانات والخوارزميات المناسبة مع تحليل تعقيد Big-O.
- تصميم قاعدة بيانات علائقية سليمة ومفهرسة.
- كتابة منطق عمل قابل للاختبار دون قاعدة بيانات حقيقية.

مرجع التقييم الكامل موجود في الملف [`nextjs_solid_algorithms_assessment.md`](./nextjs_solid_algorithms_assessment.md) (62 قسماً، شبكة تقييم من **100 نقطة**).

---

## 3. لماذا تم بناؤه والمشكلة التي يحلها

### المشكلة التي يحلها

معظم مشاريع التخرج والمشاريع التعليمية تُكتب بنمط `Component → Prisma`، أي أن:

- منطق العمل مختلط باستعلامات قاعدة البيانات، فتصبح تغييرات الواجهة مؤثرة على قاعدة البيانات والعكس.
- لا يمكن اختبار منطق العمل دون تشغيل قاعدة بيانات حقيقية.
- استعلاماتPrisma تتسرّب إلى كل طبقة، فتصبح تغييرات البنية التحتية مؤثرة على منطق العمل.
- لا يوجد عزل بين قراءة البيانات وكتابتها، ولا بين التحقق من المدخلات والتنفيذ.
- استبدال قاعدة البيانات (من PostgreSQL إلى غيرها) يتطلب إعادة كتابة التطبيق بالكامل.

### الحل المعتمد

المشروع يطبّق **البنية النظيفة (Clean Architecture)** مع اتجاه واحد للاعتماديات:

```
الواجهة (Route Handler)
        ↓
طبقة التطبيق (Application Service)  ← تحوي منطق العمل والصلاحيات
        ↓
طبقة المجال (Domain Interfaces)      ← تجريدات مستقلة عن التقنية
        ↓
طبقة البنية التحتية (Infrastructure) ← تنفيذ ملموس (Prisma, bcrypt, jose)
        ↓
PostgreSQL
```

### أمثلة تطبيقية من الكود

| المبدأ                      | مكان التطبيق                                               | المثال الحقيقي في المشروع                                                                                       |
| --------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **SRP** — المسؤولية الواحدة | فصل `Service` عن `Repository` عن `Validator` عن `Listener` | `TaskService` (منطق + صلاحيات) منفصل تماماً عن `TaskRepository` (SQL) وعن `ActivityLogListener` (تسجيل الأحداث) |
| **OCP** — المفتوح/المغلق    | استبدال bcrypt بـ Argon2 دون لمس الخدمة                    | `IHashService` ← يُنفَّذ بـ `BcryptHashService`؛ إضافة `Argon2HashService` لا تتطلب تعديل `UserService`         |
| **LSP** — الاستبدال         | نفس العقد مع تنفيذين                                       | `IHashService` و`ITokenService` — الخدمات تستهلك الواجهة وتعمل مع أي تنفيذ مطابق                                |
| **ISP** — تفاعل الواجهات    | واجهة واحدة لكل مستودع                                     | `IUserRepository` / `ITaskRepository` / `IProjectRepository` بدل واجهة عملاقة `IRepository` تحتوي كل شيء        |
| **DIP** — عكس الاعتماد      | حقن الاعتماديات عبر الـ Constructor                        | `constructor(private taskRepository: ITaskRepository)` — الخدمة لا تعرف أن Prisma موجودة                        |

### النماذج (Design Patterns)

| النمط                    | مكان الاستخدام                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------- |
| **Repository Pattern**   | `src/infrastructure/repositories/` — 5 مستودعات تحجب Prisma تماماً                    |
| **Dependency Injection** | إنشاء الخدمات يدوياً في الـ Route Handlers: `new TaskService(new TaskRepository())`   |
| **Observer / Event Bus** | `ApplicationEventBus extends EventEmitter` في `src/infrastructure/events/EventBus.ts` |
| **Singleton**            | Prisma Client على `globalThis` لتفادي تكرار الاتصالات عند Hot Reload                  |
| **Strategy**             | تمرير `Comparator<T>` كدالة إلى `mergeSort` بدل تثبيت معيار الفرز                     |
| **Factory**              | `HashTable.fromArray()` و`PriorityQueue.sortTasksByPriority()`                        |
| **Adapter**              | `@prisma/adapter-pg` + `pg.Pool` لتوصيل Prisma 7 بـ PostgreSQL                        |
| **Middleware / Proxy**   | `src/proxy.ts` لحماية المسارات وحقن الهوية في الهيدرز                                 |

---

## 4. الميزات الرئيسية

### 4.1 المصادقة والتفويض (Authentication & Authorization)

- **تسجيل حساب** عبر `POST /api/auth/register` مع تحقق Zod (8 أحرف على الأقل + حرف كبير + رقم).
- **تسجيل الدخول / الخروج** عبر **NextAuth v5** بموفر `Credentials` + `PrismaAdapter` + استراتيجية `jwt`.
- **تجزئة كلمات المرور** بـ `bcryptjs` (10 جولات) داخل `BcryptHashService`.
- **حماية كل المسارات** عبر `src/proxy.ts`:
  - طلبات `/api` بدون جلسة → `401`.
  - صفحات غير `/login` و`/register` بدون جلسة → إعادة توجيه مع `callbackUrl`.
  - مستخدم مسجّل visiting `/login` → تحويل للصفحة الرئيسية.
  - **حقن الهوية**: إضافة `user-id` و `user-role` إلى هيدرز الطلب ليستخدمها الـ Service Layer.
- **توقيع JWT مستقل** عبر `jose` في `JwtTokenService` (مستعد للتوكنات الخارجية/الـ API).
- **نظام أدوار RBAC** بثلاثة مستويات يُطبَّق **داخل طبقة الخدمات** (وليس في المكونات):

| الدور     | الصلاحيات                                                                                     |
| --------- | --------------------------------------------------------------------------------------------- |
| `ADMIN`   | كل شيء: إنشاء/تعديل/حذف المشاريع والمهام والمستخدمين                                          |
| `MANAGER` | إنشاء المشاريع، إدارة مهامه التي يملكها، تعيين المهام، عرض التحليلات                          |
| `MEMBER`  | عرض المهام المسندة إليه، تعديل **الحالة فقط**، إضافة تعليقات، تعديل الاسم فقط في الملف الشخصي |

### 4.2 إدارة المشاريع

- إنشاء / تعديل / حذف / **أرشفة** (بدل الحذف النهائي).
- بحث نصي (غير حساس لحالة الأحرف) في الاسم والوصف.
- فلترة حسب الحالة والمالك.
- **حالات المشروع**: `PLANNING` → `ACTIVE` → `COMPLETED` → `ARCHIVED`.

### 4.3 إدارة المهام

- إنشاء / تعديل / حذف / إسناد لمستخدم.
- 5 حالات: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED`.
- 4 أولويات: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- تاريخ استحقاق (`dueDate`) وساعات تقديرية (`estimatedHours`).
- بحث وفلترة حسب المشروع، الحالة، الأولوية، المكلَّف.
- تقييد العضو: يعدّل **الحالة فقط** من المهمة المسندة إليه.

### 4.4 التعليقات

- إضافة، تعديل، حذف، عرض تعليقات المهمة.
- العضو يعدّل/يحذف **تعليقاته فقط**؛ الأدمن والمدير يعدّلان أي تعليق.

### 4.5 التحليلات وحالة المشروع

دالة خالصة `calculateProjectAnalytics(tasks)` بتمرير واحد **بزمن O(n)** تحسب:

| المؤشر                                                              | الوصف                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| `totalTasks` / `completedTasks` / `remainingTasks` / `pendingTasks` | عدادات المهام                                           |
| `overdueTasks`                                                      | متأخرة: `dueDate < now` وحالتها ليست `DONE`/`CANCELLED` |
| `criticalTasks`                                                     | عدد المهام بأولوية `CRITICAL`                           |
| `completionRate` / `overdueRate`                                    | نسب مئوية مقرّبة                                        |
| `tasksByStatus` / `tasksByPriority`                                 | توزيع histogram كامل                                    |
| `healthScore`                                                       | `HEALTHY` / `AT_RISK` / `CRITICAL` عبر قاعدة تدريج      |

**منطق تصنيف صحة المشروع:**

```
CRITICAL  إذا  (completionRate < 20 && overdueRate > 30)
            أو  (criticalTasks / totalTasks > 0.2)
AT_RISK   إذا  overdueRate > 15
            أو  (completionRate < 50 && criticalTasks > 0)
HEALTHY   فيما عدا ذلك
```

### 4.6 سجل الأنشطة والتدقيق (Activity Log / Audit Trail)

- **نظام أحداث قابل للتوسعة**: 11 نوع حدث معرّف كـ `const` + أنواع TypeScript مستخرجة:
  `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_ARCHIVED`, `PROJECT_DELETED`, `TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `COMMENT_CREATED`, `COMMENT_UPDATED`, `COMMENT_DELETED`, `USER_UPDATED`.
- كل نوع له **حمولة منقولة (Payload) مكتوبة بأنواع TypeScript صريحة** في `src/domain/events/ActiviteEvents.ts` — إضافة حدث جديد = إضافة مفتاح + واجهة payload فقط.
- عند أي عملية كتابة، تُطلق الخدمة حدثاً على `eventBus`، ويتفاعل `ActivityLogListener` مع تسجيله في `ActivityLog`.
- **التسجيل غير معطِّل للرد**: يستخدم `after()` من `next/server` ليعمل بعد إرسال الاستجابة.
- **صفحة سجل تدقيق تفاعلية** في `/events`: خط زمني + قائمة لانهائية (Infinite Scroll) + لوحة تفاصيل + بحث + تلوين نوع الحدث + تنسيق التواريخ بالعربية.

### 4.7 اختبارات

**27 ملف اختبار — 184 حالة اختبار (`it`) موزعة على 93 مجموعة (`describe`)**، موزعة على ثلاث طبقات:

| الطبقة                        | العدد   | يغطي                                                                                                                                                            |
| ----------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit — الخدمات**            | 7 ملفات | `TaskService`, `ProjectService`, `TaskCommentService`, `UserService`, `ActivityLogService`, `ProjectAnalyticsService` — بادئات Mock كاملة (`tests/unit/mocks/`) |
| **Unit — الخوارزميات والأمن** | 4 ملفات | خوارزمية التحليلات، `BcryptHashService`, `JwtTokenService`, الوسيط `proxy.ts`                                                                                   |
| **Integration — المستودعات**  | 5 ملفات | اختبار حقيقي على PostgreSQL مع `deleteMany` في `beforeEach`                                                                                                     |
| **Integration — الـ API**     | 12 ملف  | استدعاء معالجات المسارات فعلياً والتحقق من رموز الحالة                                                                                                          |

---

## 5. البنية التقنية والمكتبات المستخدمة

### 5.1 الحزمة التقنية الأساسية

| الطبقة                | التقنية                                          | الإصدار              |
| --------------------- | ------------------------------------------------ | -------------------- |
| الإطار                | **Next.js (App Router)**                         | `16.3.3`             |
| واجهة المستخدم        | React / React DOM                                | `19.2.8`             |
| اللغة                 | TypeScript (`strict: true`)                      | `^5`                 |
| التنسيق               | Tailwind CSS (`@tailwindcss/postcss`)            | `^4`                 |
| قاعدة البيانات        | **PostgreSQL**                                   | `15` (Docker)        |
| ORM                   | **Prisma** + `@prisma/client` + `@prisma/config` | `^7.10.0`            |
| مُشغّل قاعدة البيانات | `pg` + `@prisma/adapter-pg` (Driver Adapter)     | `^8.23`              |
| المصادقة              | **next-auth** + `@auth/prisma-adapter`           | `^5.0.0-beta.32`     |
| التشفير               | `bcryptjs` + `jose` (JWT)                        | `^3.0.3` / `^6.2.10` |
| التحقق                | **Zod**                                          | `^4.4.3`             |
| النماذج               | React Hook Form + `@hookform/resolvers`          | `^7.86`              |
| حالة الخادم           | TanStack Query                                   | `^5.104`             |
| طلبات HTTP            | Axios                                            | `^1.20`              |
| الأيقونات             | lucide-react                                     | `^1.47`              |
| الإشعارات             | sonner (Toaster)                                 | `^2.0.8`             |
| الاختبارات            | **Vitest**                                       | `^4.1.11`            |
| جودة الكود            | ESLint (`eslint-config-next`)                    | `^9`                 |
| متغيرات البيئة        | dotenv                                           | `^17.4.2`            |

### 5.2 الطبقات المعمارية

```
src/
├── domain/              ◄── الطبقة innermost: لا تعرف أي تقنية
│   ├── interfaces/      ◄── 7 واجهات تجريدية (DIP)
│   ├── errors/          ◄── تسلسل أخطاء التطبيق
│   └── events/          ◄── أنواع الأحداث والحمولات
│
├── application/         ◄── منطق العمل والصلاحيات (يستهلك الواجهات فقط)
│   └── services/        ◄── 6 خدمات تطبيقية
│
├── infrastructure/      ◄── التنفيذ الملموس
│   ├── database/        ◄── Prisma Singleton
│   ├── repositories/    ◄── 5 مستودعات (Prisma)
│   ├── security/        ◄── bcrypt + jose
│   ├── events/          ◄── EventBus
│   ├── listeners/       ◄── مشترك تسجيل الأنشطة
│   └── queues/          ◄── معالج طابور غير متزامن
│
├── algorithms/          ◄── خوارزميات خالصة (Pure Functions)
├── data-structures/     ◄── هياكل بيانات مطبَّقة يدوياً
├── validators/          ◄── مخططات Zod
│
├── app/                 ◄── App Router: الصفحات + API Routes
│   └── api/             ◄── 14 مسار API
│
├── components/          ◄── 26 مكوّن (auth, project, task, coments, events, ui)
├── types/               ◄── أنواع مشتقّة من Prisma + توسيع NextAuth
├── lib/                 ◄── أدوات مشتركة (تنسيق التواريخ والأحداث، Prisma)
├── providers/           ◄── React Query / Session providers
└── utils/               ◄── حساب قوة كلمة المرور
```

### 5.3 قواعد الاعتماد بين الطبقات (Dependency Rule)

```
components/  ──►  app/api  ──►  application  ──►  domain/interfaces  ◄──  infrastructure
     │               │              │                                              │
     └───────────────┴──────────────┴──────────────────────┬───────────────────────────┘
                                                              ▼
                                              PostgreSQL / bcrypt / jose
```

**القاعدة الذهبية المطبَّقة:** استيراد `@prisma/client` (للأنواع) مسموح في كل مكان، لكن **استدعاء `prisma.*` مسموح فقط داخل `src/infrastructure/`**.

### 5.4 الخوارزميات وهياكل البيانات المطبَّقة

#### `src/algorithms/`

| الملف                           | المحتوى                                                      | التعقيد                             |
| ------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| `projectAnalyticsCalculator.ts` | إحصائيات المشروع + `healthScore`                             | **O(n)** — مرور واحد                |
| `mergeSort.ts`                  | `mergeSort<T>(items, comparator)` + `compareTaskByCreatedAt` | **O(n log n)** زمن / **O(n)** مساحة |

#### `src/data-structures/`

| الملف              | المحتوى                                                                                                      | التعقيد                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `HashTable.ts`     | جدول تجزئة بـ Buckets، دالة تجزئة بمعامل أولي `31`، معالجة تصادمات، `set/get/delete/clear`، ثابت `fromArray` | متوسط **O(1)** / أسوأ **O(n)** |
| `Queue.ts`         | طابور FIFO بمؤشري `head`/`tail`                                                                              | **O(1)** لكل عملية             |
| `PriorityQueue.ts` | طابور أولوية على **Binary Heap** مع `bubbleUp` / `bubbleDown`                                                | **O(log n)** إدراج/استخراج     |

### 5.5 نموذج البيانات

```
User (id, name, email[unique], passwordHash, role, timestamps)
  ├── owns ────────────► Project
  ├── assignedTasks ───► Task (assigneeId, onDelete: SetNull)
  ├── createdTasks ────► Task (ownerId,    onDelete: Cascade)
  ├── comments ────────► TaskComment
  └── activityLogs ────► ActivityLog

Project (id, name, description?, ownerId, status, timestamps)
  ├── tasks ───────────► Task (projectId, onDelete: Cascade)
  └── activityLogs ────► ActivityLog (onDelete: SetNull)

Task (id, title, description?, status, priority, projectId, ownerId,
      assigneeId?, dueDate?, estimatedHours?, timestamps)
  ├── comments ────────► TaskComment (onDelete: Cascade)
  └── activityLogs ────► ActivityLog (onDelete: SetNull)

TaskComment (id, taskId, authorId, content, timestamps)

ActivityLog (id, userId, action, metadata Json?,
             projectId?, taskId?, createdAt)
```

**قرارات تصميم قاعدة البيانات:**

- **4 Enums** بدل `String` (`Role`, `ProjectStatus`, `TaskStatus`, `Priority`) — سلامة نوع + قيود على مستوى DB.
- **سياسات حذف مرشّحة** (`onDelete`): `Cascade` لـ Tasks/Comments (تبعية وجودية)، `SetNull` لـ assignee/activityLog (سجل تاريخي لا يجوز أن يختفي).
- **فهارس (`@@index`) مدروسة** على الأعمدة المستخدمة فعلياً في `WHERE`:
  `Project(ownerId, status)` · `Task(projectId, assigneeId, ownerId, status, priority, dueDate)` · `TaskComment(taskId, authorId)` · `ActivityLog(projectId, userId, createdAt, taskId)`.
- **`metadata` كـ `Json`** يجعل نظام التدقيق قابلاً للتوسعة دون أعمدة جديدة لكل نوع حدث.
- **`@updatedAt`** تلقائي + **Migrate** منفصل في `prisma/migrations/20260828142527_init_schema/`.

### 5.6 معالج الأخطاء

```
Error
  └── AppError (statusCode افتراضي 400)
        ├── UnauthorizedError (401)  بيانات دخول خاطئة
        ├── ForbiddenError  (403)   صلاحيات غير كافية
        ├── NotFoundError   (404)   العنصر غير موجود
        └── ConflictError  (409)   بيانات متضاربة / مسجلة مسبقاً
```

كل `Route Handler` يلتزم بنمط موحّد: `try/catch` → فحص `instanceof AppError` → إرجاع `error.statusCode` مع رسالة عربية، وإلا `500` برسالة عامة دون تسريب تفاصيل داخلية.

### 5.7 واجهات الـ API

| الطريقة                | المسار                         | الوظيفة                                  |
| ---------------------- | ------------------------------ | ---------------------------------------- |
| `POST`                 | `/api/auth/register`           | تسجيل حساب جديد                          |
| `*`                    | `/api/auth/[...nextauth]`      | معالج NextAuth (دخول/خروج/جلسة)          |
| `GET` `POST`           | `/api/projects`                | قائمة المشاريع (بحث/فلترة) · إنشاء مشروع |
| `GET` `PATCH` `DELETE` | `/api/projects/[id]`           | تفاصيل · تعديل · حذف                     |
| `PATCH`                | `/api/projects/[id]/archive`   | أرشفة المشروع                            |
| `GET`                  | `/api/projects/[id]/analytics` | إحصائيات المشروع + صحة المشروع           |
| `GET`                  | `/api/projects/[id]/activity`  | سجل أنشطة المشروع                        |
| `GET` `POST`           | `/api/projects/[id]/tasks`     | مهام المشروع (فلترة) · إنشاء مهمة        |
| `GET` `PATCH` `DELETE` | `/api/tasks/[id]`              | تفاصيل · تعديل · حذف                     |
| `GET` `POST`           | `/api/tasks/[id]/comments`     | تعليقات المهمة · إضافة تعليق             |
| `PATCH` `DELETE`       | `/api/coments/[id]`            | تعديل/حذف تعليق                          |
| `GET`                  | `/api/users?role=`             | قائمة المستخدمين حسب الدور               |
| `GET` `PATCH`          | `/api/users/[id]`              | تفاصيل · تعديل مستخدم                    |
| `GET`                  | `/api/events`                  | سجل الأحداث مع ترقيم صفحات               |
| `GET`                  | `/api/events/[id]`             | تفاصيل حدث واحد                          |

### 5.8 الصفحات

| المسار                 | الصفحة                                         |
| ---------------------- | ---------------------------------------------- |
| `/`                    | لوحة المشاريع — شبكة متجاوبة، بحث، نافذة إنشاء |
| `/login` · `/register` | المصادقة مع مقياس قوة كلمة المرور              |
| `/projects/[id]`       | تفاصيل المشروع — المهام، التحليلات، التعليقات  |
| `/tasks/[id]`          | تفاصيل المهمة                                  |
| `/events`              | سجل التدقيق: خط زمني + تفاصيل + بحث            |
| `/profile`             | الملف الشخصي وتعديل البيانات                   |

---

## 6. طريقة التشغيل والاستخدام

### 6.1 المتطلبات

- **Node.js 20+** (مستهدف `ES2022`)
- **Docker** (أو PostgreSQL 15 مثبّت محلياً)
- **npm**

### 6.2 الخطوات

```bash
# 1) تشغيل قاعدة البيانات (PostgreSQL على المنفذ 5433)
docker compose up -d

# 2) تثبيت الحزم (يشغّل prisma generate تلقائياً عبر postinstall)
npm install

# 3) تطبيق المخطط على قاعدة البيانات
npx prisma migrate deploy      # أو: npx prisma migrate dev

# 4) زرع البيانات التجريبية
npx prisma db seed

# 5) تشغيل خادم التطوير
npm run dev
```

افتح المتصفح على **<http://localhost:3000>**

او

قم بزيارة المشروع على vercel **<https://nextjs-solid-algorithms-assessment-2ccccwew8-feras4.vercel.app/>**

### 6.3 كل الأوامر المتاحة

| الأمر                    | الوظيفة                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `npm run dev`            | خادم التطوير (Hot Reload)                                                          |
| `npm run build`          | بناء الإنتاج                                                                       |
| `npm start`              | تشغيل بناء الإنتاج                                                                 |
| `npm run lint`           | ESLint                                                                             |
| `npm test`               | Vitest — **ملاحظة:** يعمل في وضع `watch`، استخدم `npx vitest run` لتنفيذ مرة واحدة |
| `npm run postinstall`    | `prisma generate` (تلقائي)                                                         |
| `npx prisma studio`      | واجهة متصفح بصرية للقاعدة                                                          |
| `npx prisma migrate dev` | إنشاء/تطبيق migration في التطوير                                                   |

### 6.4 متغيرات البيئة

أنشئ ملف `.env` (أو انسخه من `.env.example`):

```bash
# مطلوب — سلسلة اتصال PostgreSQL
DATABASE_URL="postgresql://[ADMIN]:[PASSWORD]@localhost:5433/smart_task_db?schema=public"

# مطلوب — توقيع التوكنات
JWT_SECRET="<سلسلة عشوائية طويلة>"

# مطلوب — NextAuth
AUTH_SECRET="<سلسلة عشوائية>"
NEXTAUTH_SECRET="<نفس AUTH_SECRET>"
```

> ملف `.env.test` يُحمَّل تلقائياً بواسطة `vitest.config.ts` ويستخدم `localhost:5433` — **اختبارات التكامل تتطلب قاعدة البيانات تعمل**.

### 6.5 بيانات الدخول التجريبية

جميع كلمات المرور في ملف الزرع: **`Password123`**

| الدور     | البريد                                  |
| --------- | --------------------------------------- |
| `ADMIN`   | `admin@example.com`                     |
| `MANAGER` | `manager1@…` حتى `manager4@example.com` |
| `MEMBER`  | `member1@…` حتى `member20@example.com`  |

**حجم البيانات المزروعة:** 25 مستخدماً · 4 مشاريع · 20 مهمة · 60 تعليقاً · 80+ سجل نشاط — مع تنويع في الأدوار والأولويات والحالات ومهام متأخرة وتواريخ استحقاق.

### 6.6 مثال على الاستخدام برمجياً

```bash
# تسجيل حساب
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"سالم","email":"salem@example.com","password":"Password123"}'

# إنشاء مشروع (يتطلب جلسة + هيدرز user-id / user-role)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "user-id: <USER_UUID>" -H "user-role: MANAGER" \
  -d '{"name":"منصة المدفوعات","description":"إطلاق بوابة الدفع الجديدة"}'

# قراءة تحليلات المشروع
curl "http://localhost:3000/api/projects/<PROJECT_UUID>/analytics" \
  -H "user-id: <USER_UUID>" -H "user-role: MANAGER"
```

### 6.7 توصيات قبل التشغيل

1. **`npm test` يعمل في وضع المراقبة** — استعمل `npx vitest run` أو `npx vitest --run` في CI.
2. **مخطط قاعدة البيانات يفتقد `datasource.url`**: في `schema.prisma` الكتلة `datasource db` تحتوي `provider` فقط، وخاصية `url` معرَّفة داخل `generator` بدلاً من ذلك. إن ظهرت مشكلة اتصال، أضف `url = env("DATABASE_URL")` إلى `datasource`.
3. **ملف `.env` يحتوي أسراراً حقيقية** (بيانات Neon) رغم أن `.env*` مُستثنى في `.gitignore` — **يجب تدوير تلك المفاتيح فوراً** وعدم إبقاء الملف على القرص في أي نسخة منشورة.
4. **غيّر كلمة مرور Docker** في `docker-compose.yml` قبل أي استخدام خارج الجهاز المحلي.
5. **ثبّت إصدار Node** في `.nvmrc` أو `engines` لتوحيد بيئة التطوير.

---

## 7. هيكل المجلدات

```
nextjs_solid_algorithms_assessment/
│
├── 📄 الجذر
│   ├── nextjs_solid_algorithms_assessment.md   ← نص التقييم الرسمي (62 قسماً)
│   ├── StepCreationMethod.md                   ← خطة البناء خطوة بخطوة
│   ├── PROJECT_OVERVIEW.md                     ← هذا الملف
│   ├── README.md                               ← (القالب الافتراضي، لم يُحدَّث بعد)
│   ├── package.json                            ← السكربتات والحزم
│   ├── docker-compose.yml                      ← PostgreSQL 15 على المنفذ 5433
│   ├── tsconfig.json                           ← aliases: @/ @src/ @tests/
│   ├── next.config.ts                          ← serverExternalPackages: prisma, pg
│   ├── vitest.config.ts                        ← بيئة node، تحميل .env.test
│   ├── eslint.config.mjs                       ← core-web-vitals + typescript
│   ├── postcss.config.mjs                      ← Tailwind 4
│   ├── skills-lock.json                        ← تثبيت مهارات Prisma للم全镇
│   ├── .env / .env.test                        ← متغيرات البيئة (مستثناة من Git)
│   ├── .gitignore
│   │
│   ├── 🗄️ prisma/
│   │   ├── schema.prisma                       ← 5 موديلات + 4 Enums + الفهارس
│   │   ├── seed.ts                             ← بيانات تجريبية واقعية
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       └── 20260828142527_init_schema/migration.sql
│   │
│   ├── 🧪 tests/
│   │   ├── unit/
│   │   │   ├── services/          ← 6 اختبارات للخدمات (بادئات Mock)
│   │   │   ├── algorithms/         ← اختبارات calculateProjectAnalytics
│   │   │   ├── infrastructure/security/  ← BcryptHashService, JwtTokenService
│   │   │   ├── mocks/              ← mockData.ts, mockRepositories.ts
│   │   │   └── proxy.test.ts       ← اختبارات الوسيط وحقن الهيدرز
│   │   └── integration/
│   │       ├── repositories/       ← 5 اختبارات على PostgreSQL حقيقي
│   │       └── api/                ← 12 اختبار لمعالجات المسارات
│   │
│   ├── ⚙️ src/
│   │   ├── domain/                        ── لا تعرف أي تقنية خارجية
│   │   │   ├── interfaces/
│   │   │   │   ├── IUserRepository.ts
│   │   │   │   ├── IProjectRepository.ts
│   │   │   │   ├── ITaskRepository.ts
│   │   │   │   ├── ITaskCommentRepository.ts
│   │   │   │   ├── IActivityLogRepository.ts
│   │   │   │   ├── IHashService.ts
│   │   │   │   └── ITokenService.ts
│   │   │   ├── errors/AppError.ts         ← تسلسل الأخطاء ورموز HTTP
│   │   │   └── events/ActiviteEvents.ts   ← 11 حدث + حمولاتها
│   │   │
│   │   ├── application/services/          ── منطق العمل + الصلاحيات
│   │   │   ├── TaskService.ts
│   │   │   ├── ProjectService.ts
│   │   │   ├── TaskCommentService.ts
│   │   │   ├── UserService.ts
│   │   │   ├── ActivityLogService.ts
│   │   │   └── ProjectAnalyticsService.ts
│   │   │
│   │   ├── infrastructure/                 ── التنفيذ الملموس
│   │   │   ├── database/prisma.ts          ← Singleton + PrismaPg adapter
│   │   │   ├── repositories/               ← 5 مستودعات (المكان الوحيد لاستدعاء prisma)
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── ProjectRepository.ts
│   │   │   │   ├── TaskRepository.ts
│   │   │   │   ├── TaskCommentRepository.ts
│   │   │   │   └── ActivityLogRepository.ts
│   │   │   ├── security/
│   │   │   │   ├── BcryptHashService.ts
│   │   │   │   └── JwtTokenService.ts
│   │   │   ├── events/EventBus.ts          ← EventEmitter على globalThis
│   │   │   ├── listeners/ActivityLogListener.ts  ← 11 مشترك
│   │   │   └── queues/ActivityLogService.ts      ← معالج طابور
│   │   │
│   │   ├── algorithms/
│   │   │   ├── projectAnalyticsCalculator.ts
│   │   │   └── mergeSort.ts
│   │   │
│   │   ├── data-structures/
│   │   │   ├── HashTable.ts
│   │   │   ├── Queue.ts
│   │   │   └── PriorityQueue.ts
│   │   │
│   │   ├── validators/                     ← مخططات Zod
│   │   │   ├── auth.schema.ts
│   │   │   ├── project.schema.ts
│   │   │   ├── task.schema.ts
│   │   │   └── comment.schema.ts
│   │   │
│   │   ├── app/                            ── App Router
│   │   │   ├── layout.tsx                  ← Geist, RTL, providers, Toaster
│   │   │   ├── page.tsx                    ← لوحة المشاريع
│   │   │   ├── globals.css · icon.svg
│   │   │   ├── login/ · register/ · profile/
│   │   │   ├── projects/[id]/ · tasks/[id]/
│   │   │   ├── events/page.tsx             ← سجل التدقيق
│   │   │   └── api/                        ← 15 ملف مسار
│   │   │       ├── auth/[...nextauth]/ · auth/register/
│   │   │       ├── users/ · users/[id]/
│   │   │       ├── projects/ · projects/[id]/
│   │   │       │            · projects/[id]/tasks/
│   │   │       │            · projects/[id]/analytics/
│   │   │       │            · projects/[id]/activity/
│   │   │       │            · projects/[id]/archive/
│   │   │       ├── tasks/[id]/ · tasks/[id]/comments/
│   │   │       ├── coments/[id]/
│   │   │       └── events/ · events/[id]/
│   │   │
│   │   ├── components/                     ← 26 مكوّن
│   │   │   ├── auth/      (LoginForm, RegisterForm, ProfileForm)
│   │   │   ├── project/   (ProjectCard, ProjectInfoCard, Create/Update modal)
│   │   │   ├── task/      (TaskCard, TaskInfoCart, Create/Edit modal)
│   │   │   ├── coments/   (Listcoments, editeComment)
│   │   │   ├── events/    (EventCard, EventTimelineList, EventDetailView,
│   │   │   │                EventMetadataGrid, EventPayloadViewer)
│   │   │   └── ui/        (Button, Input, PasswordInput, Header, Footer,
│   │   │                    NavLink, AppLogo, UserProfileHeader)
│   │   │
│   │   ├── types/           ← أنواع مشتقّة من Prisma.GetPayload + توسيع NextAuth
│   │   ├── lib/             ← event-formatters, prisma
│   │   ├── providers/       ← ReactQueryProvider
│   │   ├── utils/           ← getPasswordStrength
│   │   ├── validators/
│   │   ├── auth.ts          ← إعداد NextAuth
│   │   ├── proxy.ts         ← Middleware: الحماية + حقن الهوية
│   │   └── instrumentation.ts ← تسجيل المستمعين عند الإقلاع
│   │
│   ├── 🖼️ public/           ← next.svg, vercel.svg, globe.svg, file.svg, window.svg
│   │
│   ├── 🤖 .agents/ · .claude/ · .windsurf/
│   │                          ← مهارات Prisma مُثبَّتة لكل بيئة أدوات
│   └── 📦 node_modules/ · .next/
```

---

## 8. أفكار تطوير مستقبلية

### 8.1 استكمال التوثيق المطلوب

التقييم يطلب أربعة ملفات توثيق، الحالة الحالية:

| الملف             | الحالة                                     | المحتوى المطلوب                                                                                                                   |
| ----------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`       | ⚠️ **القالب الافتراضي لـ create-next-app** | نظرة عامة، الحزمة التقنية، التثبيت، المتغيرات، إعداد DB، أوامر Prisma، الاختبارات، نظرة معمارية، بيانات الدخول، لقطات شاشة        |
| `ARCHITECTURE.md` | ❌ مفقود                                   | البنية، تدفق البيانات، تدفق المصادقة، دورة حياة الطلب، الوصول للقاعدة، النمط المستودعي، حقن الاعتماديات + **مخطط واحد على الأقل** |
| `SOLID.md`        | ❌ مفقود                                   | لكل مبدأ: أين نُفّذ، لماذا كان ضرورياً، مثال كود، التصميم البديل المدروس                                                          |
| `ALGORITHMS.md`   | ❌ مفقود                                   | لكل خوارزمية/هيكل: المشكلة، التنفيذ، التعقيد، المفاضلات، موقع الاستخدام                                                           |
| `.env.example`    | ❌ مفقود                                   | أسماء المتغيرات بقيم نموذجية بلا أسرار                                                                                            |

### 8.2 ميزات وظيفية للتوسع

**محرك التبعيات بين المهام** (التحدي الإضافي في التقييم):
جدول `TaskDependency(taskId, dependsOnTaskId)` + واجهة `ITaskDependencyRepository`، مع منع الدورات عبر DFS، وتحديد هل يمكن إكمال مهمة، وعرض المخطط البياني في الواجهة.

**الترقيم المتقدم (Pagination)**:

- ترقيم الصفحات.Server-side موجود حالياً في سجل الأحداث فقط → تطبيقه على المهام والمشاريع.
- **Cursor pagination**: يعتمد على `id` أو `createdAt` — أفضل من `OFFSET` عند ملايين السجلات لأن الأداء يبقى ثابتاً ولا يتأثر بالإدخالات/الحذف.
- إرجاع `{ data, page, limit, total, totalPages }` كما يطلب التقييم.

**إشعارات المستخدم**:
مزوّد `INotificationProvider` مع `EmailNotificationProvider` و `InAppNotificationProvider` و `SlackNotificationProvider` — مثال حي إضافي لـ **OCP** و **LSP**.

**البحث المتقدم**: فهرس PostgreSQL `GIN` مع `pg_trgm` أو بحث كامل نصي `tsvector` للبحث الدلالي في المهام والتعليقات.

**الملفات والمرفقات**: جدول `Attachment` + تخزين S3 + روابط موقّتة.

**الويب سوكيت / SSE**: بث سجل الأحداث مباشرةً لواجهة `/events` بدلاً من الاستقصاء.

### 8.3 التحسينات التقنية والبنية التحتية

| المجال                | التحسين                                                                                           | الفائدة                                |
| --------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **الاختبارات**        | Playwright لاختبارات E2C + Report تغطية (`@vitest/coverage-v8`) + معيار جودة (85%+ تغطية للخدمات) | ثقة في التغييرات                       |
| **الحاويات**          | `Dockerfile` متعدد المراحل + `docker-compose` يشمل التطبيق وقاعدة البيانات وRedis                 | تشغيل متناسق في كل بيئة                |
| **الطوابير**          | استبدال `setInterval` بـ **BullMQ + Redis** لعامل صامد (durable)                                  | لا تضيع الأحداث عند إعادة التشغيل      |
| **الذاكرة المؤقتة**   | Redis أو `unstable_cache` للتحليلات ونتائج البحث                                                  | تقليل الضغط على PostgreSQL             |
| **الحاوية**           | نقل `src/lib` إلى حزمة `packages/domain` مستقلة                                                   | إعادة استخدام المنطق عبر مشاريع متعددة |
| **الاختبارات الآلية** | GitHub Actions: lint → typecheck → test → build                                                   | منع التراجع في الجودة                  |
| **التوثيق**           | Swagger / OpenAPI مولّد من مخططات Zod                                                             | توثيق الـ API آلياً ومتسق              |
| **المراقبة**          | Sentry للأخطاء + OpenTelemetry للتتبّع                                                            | تشخيص مشكلات الإنتاج                   |
| **الوصولية**          | اختبار بـ axe، إدارة تركيز (focus trap) في النوافذ المنبثقة، تسميات ARIA                          | توافق WCAG                             |
| **إدارة الأخطاء**     | Sentry + `ErrorBoundary` على مستوى التطبيق + تقارير أخطاء من طرف العميل                           | عدم فقدان الأخطاء في الإنتاج           |
| **قاعدة البيانات**    | `EXPLAIN ANALYZE` دوري +归档 للمهام ancient + جدول تجزئة افتراضي                                  | جاهزية لملايين السجلات                 |
| **الأمان**            | تحديد معدل الطلبات (Rate Limiting) عبر Upstash، ترويسات أمان HTTP، تدوير دوري للأسرار             | دفاع متعدد الطبقات                     |
| **الترميز**           | Prettier (مطلوب في التقييم وغير مُضبوط)، `typecheck` سكربت، CI                                    | اتساق التنسيق ومنع أخطاء النوع         |
| **التدويل**           | استخراج النصوص العربية لمفات i18n                                                                 | تسهيل دعم لغات أخرى                    |

### 8.4 مسارScaling (ماذا-change عند 10 ملايين مهمة؟)

1. **نقل الفرز والفلترة إلى PostgreSQL** بدل الخوارزميات على الذاكرة — الخوارزميات تبقى للحالات التي لا يتفوق عليها الفهرس.
2. **فهرسة جزئية** على المهام النشطة: `WHERE status NOT IN ('DONE','CANCELLED')`.
3. **الترقيم بالمؤشر** بدل `OFFSET` (تجاوز 10 آلاف سجل يصبح بطيئاً بشكل حاد).
4. **التقسيم (Partitioning)** الجداول على `createdAt` حسب الشهر أو السنة.
5. **قراءة منفصلة** (Read Replica) للتقارير والتحليلات الثقيلة.
6. **تخزين الأحداث** في جدول منفصل مقسّم، مع `retention policy`.
7. **نقل التسجيل إلى عامل غير متزامن** (Queue) حتى لا يؤثر على زمن الاستجابة مهما زاد الحجم.
8. **CDN + تخزين مؤقت للصفحات العامة** والتقاطعات.

---

## 9. ملخص التقييم الذاتي

| المحور              | القوة                                                | الفجوة                                                         |
| ------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| **معمارية الطبقات** | ممتازة — 4 طبقات نظيفة مع اتجاه اعتماديات أحادي      | تسرّب `prisma` في `auth.ts`؛ نسختا Prisma                      |
| **SOLID**           | مُنفَّذ فعلياً في 5 مواقع واضحة                      | يوثَّق في `SOLID.md`                                           |
| **الخوارزميات**     | دالة تحليلية نظيفة O(n) مربوطة + Merge Sort          | بعض الخوارزميات غائبة،والمُنفَّذة غير مربوطة لتجنب بطء التنفيذ |
| **هياكل البيانات**  | 3 هياكل مطبَّقة يدوياً بجودة جيدة                    | غير مربوطة؛ `Stack` مفقود                                      |
| **قاعدة البيانات**  | Enums + فهارس + سياسات حذف + Json                    | `datasource.url` معرّف في مكان غير معتاد                       |
| **الأمان**          | RBAC في طبقة الخدمات + bcrypt + zod + حماية المسارات | قد يحوي أسرار حقيقية في `.env`                                 |
| **الاختبارات**      | 184 حالة على 3 طبقات                                 | ينقصها تغطية بعض الخوارزميات                                   |
| **التوثيق**         | وثائق التقييم + خطة البناء متوفرة                    | `ARCHITECTURE.md` / `SOLID.md` / `ALGORITHMS.md` مفقودة        |
| **الواجهة**         | عربية RTL متجاوبة، صفحة تدقيق تفاعلية                | مكوّنات كبيرة في بعض الصفحات                                   |

> **الخلاصة:** المشروع يمتلك أساساً معمارياً قوياً ومقنعاً — الطبقات نظيفة، ومبادئ SOLID حقيقية وليست شكلية، وتصميم قاعدة البيانات مدروس، و184 حالة اختبار. نقاط التحسين الأكثر إلحاحاً هي: ، **ربط الخوارزميات وهياكل البيانات المطبَّقة فعلياً بالتطبيق**، **استكمال ملفات التوثيق الثلاثة المطلوبة**.

---

<div align="center">

**صُنع بـ Next.js 16 · Prisma 7 · PostgreSQL 15 · TypeScript 5 · SOLID**

</div>

<div align="center">

**بني من قبل Feras Salloum**

</div>
