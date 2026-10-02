// EventBus.ts
import { EventEmitter } from "events";

class ApplicationEventBus extends EventEmitter {}

// حفظ النسخة في globalThis لمنع إنشائها مجدداً عند الـ Hot Reload في Next.js
const globalForEventBus = globalThis as unknown as {
  eventBus: ApplicationEventBus | undefined;
};

export const eventBus = globalForEventBus.eventBus ?? new ApplicationEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForEventBus.eventBus = eventBus;
}
