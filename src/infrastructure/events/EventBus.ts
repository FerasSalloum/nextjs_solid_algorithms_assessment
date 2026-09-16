import { EventEmitter } from "events";

class ApplicationEventBus extends EventEmitter {}

// كائن أحادي (Singleton) لنشر واستقبال الأحداث على مستوى التطبيق
export const eventBus = new ApplicationEventBus();
