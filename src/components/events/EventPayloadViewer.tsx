import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

// استخدام Generic Type <T> يضمن الصرامة الكاملة في TypeScript
interface EventPayloadViewerProps<T = unknown> {
  payload: T;
}

export function EventPayloadViewer<T>({ payload }: EventPayloadViewerProps<T>) {
  const [copied, setCopied] = useState(false);

  const jsonString = payload
    ? JSON.stringify(payload, null, 2)
    : JSON.stringify({ message: "لا توجد بيانات إضافية للعرض" }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl font-mono text-xs dir-ltr text-left">
      <div className="bg-[#111827] px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          <span className="text-[11px] font-semibold text-slate-400 ml-2 font-sans">
            audit_payload.json
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
            VALID JSON
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="نسخ البيانات"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 overflow-x-auto max-h-95 text-emerald-400/90 leading-relaxed font-mono whitespace-pre-wrap break-all">
        <pre>{jsonString}</pre>
      </div>
    </div>
  );
}
