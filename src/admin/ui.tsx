import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ---------------- toasts ---------------- */
type Tone = "success" | "error" | "info";
interface Toast {
  id: number;
  msg: string;
  tone: Tone;
}
const ToastCtx = createContext<(msg: string, tone?: Tone) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((msg: string, tone: Tone = "success") => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, msg, tone }]);
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };
  const tones = {
    success: "border-blue/30 text-blue dark:border-sky/40 dark:text-sky",
    error: "border-spark/50 text-spark-600 dark:text-spark",
    info: "border-line text-soft",
  };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2.5">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = icons[t.tone];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-surface px-4 py-3.5 text-sm font-medium text-ink shadow-soft backdrop-blur dark:text-white ${tones[t.tone]}`}
              >
                <Icon size={17} className="mt-0.5 shrink-0" />
                <span className="text-ink dark:text-white">{t.msg}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- confirmation dialog ---------------- */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] grid place-items-center bg-[#071a33]/65 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-soft"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-spark/15 text-spark-600 dark:text-spark">
              <AlertTriangle size={20} />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-soft">{body}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-soft transition-colors hover:border-sky hover:text-blue"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                autoFocus
                className="rounded-full bg-spark px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-transform hover:-translate-y-0.5"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- skeletons ---------------- */
export function Panel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[var(--surface-2)] dark:bg-deep-3 ${className}`} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-soft">
      <Loader2 size={15} className="animate-spin" />
      {label}
    </span>
  );
}

/* ---------------- form primitives ---------------- */
export const inputCls =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-all placeholder:text-soft focus:border-sky focus:ring-4 focus:ring-sky/15 dark:text-white";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="spec-label mb-2 block text-soft">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-soft">{hint}</span>}
    </label>
  );
}

/* ---------------- misc ---------------- */
export function Pill({ tone, children }: { tone: "blue" | "spark" | "muted" | "green"; children: ReactNode }) {
  const map = {
    blue: "bg-blue/12 text-blue dark:bg-sky/15 dark:text-sky",
    spark: "bg-spark/15 text-spark-600 dark:text-spark",
    muted: "bg-[var(--surface-2)] text-soft dark:bg-deep-3 dark:text-white/60",
    green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${map[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <Info className="mx-auto text-soft/60" size={26} />
      <h3 className="mt-4 font-display text-lg font-semibold text-ink dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-soft">{body}</p>
    </div>
  );
}

export function useFakeLoad(ms = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return loading;
}

export function CloseBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-soft transition-colors hover:border-spark hover:text-spark"
    >
      <X size={16} />
    </button>
  );
}
