import { motion } from "framer-motion";
import { ArrowUpRight, Mail, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { admin, ugx, useDB, waLink, type Testimonial } from "../lib/db";
import { Field, Panel, Pill, Skeleton, ToastHost, inputCls, useFakeLoad, useToast } from "./ui";

/* ================= auth ================= */
const KEY = "kimuna.admin.session";
const LIMIT_KEY = "kimuna.admin.attempts";
const TTL = 30 * 60 * 1000;

export interface Session {
  email: string;
  role: string;
  exp: number;
  token: string;
}

const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};
const PASSWORD_HASH = hash("kimuna@2026");

export function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (Date.now() > s.exp) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; message: string; session?: Session; lockSeconds?: number }> {
  await new Promise((r) => setTimeout(r, 650));

  let attempts: { n: number; until: number } = { n: 0, until: 0 };
  try {
    attempts = JSON.parse(sessionStorage.getItem(LIMIT_KEY) || '{"n":0,"until":0}');
  } catch {
    /* reset */
  }

  if (attempts.until > Date.now()) {
    const lockSeconds = Math.ceil((attempts.until - Date.now()) / 1000);
    return { ok: false, message: `Rate limited. Try again in ${lockSeconds}s.`, lockSeconds };
  }

  const valid = email.trim().toLowerCase() === "admin@kimuna.ug" && hash(password) === PASSWORD_HASH;
  if (!valid) {
    const n = attempts.n + 1;
    const until = n >= 5 ? Date.now() + 30_000 : 0;
    // n is preserved past the lock so repeated abuse keeps re-locking
    sessionStorage.setItem(LIMIT_KEY, JSON.stringify({ n, until }));
    return {
      ok: false,
      message: until
        ? "Too many failed attempts — locked for 30 seconds."
        : `Invalid credentials. ${5 - n} attempt${5 - n === 1 ? "" : "s"} left.`,
      lockSeconds: until ? 30 : undefined,
    };
  }

  sessionStorage.removeItem(LIMIT_KEY);
  const now = Date.now();
  const session: Session = {
    email: "admin@kimuna.ug",
    role: "superadmin",
    exp: now + TTL,
    token: btoa(JSON.stringify({ sub: "admin-1", iat: now, exp: now + TTL, role: "superadmin" })) + ".demo-signature",
  };
  sessionStorage.setItem(KEY, JSON.stringify(session));
  return { ok: true, message: "ok", session };
}

/* ================= session expiry bar ================= */
export function ExpiryBar({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [left, setLeft] = useState(session.exp - Date.now());
  const toast = useToast();

  useEffect(() => {
    const t = window.setInterval(() => {
      const ms = session.exp - Date.now();
      setLeft(ms);
      if (ms <= 0) {
        toast("Session expired — you have been signed out.", "info");
        onLogout();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [session.exp, onLogout, toast]);

  const pct = Math.max(0, Math.min(100, (left / TTL) * 100));
  const minutes = Math.max(0, Math.floor(left / 60000));
  const seconds = Math.max(0, Math.floor((left % 60000) / 1000));
  const warn = left < 120_000;

  return (
    <div className={`border-b px-4 py-2 sm:px-6 ${warn ? "border-spark/40 bg-spark/10" : "border-line bg-surface"}`}>
      <div className="mx-auto flex max-w-[1240px] items-center gap-3">
        <span className={`spec-label ${warn ? "text-spark-600 dark:text-spark" : "text-soft"}`}>
          JWT session · auto-logout
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)] dark:bg-deep-3">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${warn ? "bg-spark" : "bg-blue dark:bg-sky"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`spec-label tabular ${warn ? "text-spark-600 dark:text-spark" : "text-soft"}`}>
          {minutes}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

/* ================= overview ================= */
function StatCard({
  label,
  value,
  note,
  accent,
  index,
}: {
  label: string;
  value: number | string;
  note: string;
  accent: string;
  index: number;
}) {
  const loading = useFakeLoad(400 + index * 90);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-soft">
      <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} aria-hidden="true" />
      <span className="spec-label text-soft">{label}</span>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-24 rounded-xl" />
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display mt-2 text-4xl font-extrabold text-ink tabular dark:text-white"
        >
          {value}
        </motion.p>
      )}
      <p className="mt-2 text-xs text-soft">{note}</p>
    </div>
  );
}

function MonthChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="spec-label text-soft">Requests per month</span>
          <h3 className="font-display mt-1 text-lg font-bold text-ink dark:text-white">Quote volume</h3>
        </div>
        <span className="spec-label text-blue dark:text-sky">Last {data.length} months</span>
      </div>
      <div className="mt-6 flex h-52 items-end gap-3 sm:gap-5">
        {data.map((d, i) => (
          <div key={d.label + i} className="group flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-bold text-ink tabular dark:text-white">{d.count}</span>
            <div className="relative flex h-full w-full items-end justify-center rounded-xl bg-[var(--surface-2)] dark:bg-deep-3">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-xl bg-gradient-to-t from-blue to-sky transition-all group-hover:from-blue group-hover:to-spark dark:from-sky dark:to-blue"
                style={{ minHeight: d.count ? 8 : 2 }}
              />
            </div>
            <span className="spec-label text-soft">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Overview() {
  const db = useDB();
  const loading = useFakeLoad(520);

  const stats = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = db.quotes.filter((q) => {
        const c = new Date(q.createdAt);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;
      months.push({ label: d.toLocaleString("en", { month: "short" }), count });
    }
    return { months };
  }, [db.quotes]);

  const newQuotes = db.quotes.filter((q) => q.status === "new").length;

  return (
    <Panel>
      <div className="mb-7">
        <span className="spec-label text-blue dark:text-sky">Dashboard</span>
        <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl dark:text-white">Overview</h1>
        <p className="mt-1.5 text-sm text-soft">Everything arriving from the public KIMUNA website, in real time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="New quote requests" value={newQuotes} note="Awaiting first response" accent="bg-spark" />
        <StatCard index={1} label="Total projects" value={db.projects.length} note={`${db.projects.filter((p) => p.published).length} published to gallery`} accent="bg-blue dark:bg-sky" />
        <StatCard index={2} label="Products listed" value={db.products.length} note={`${db.products.filter((p) => p.stock).length} in stock`} accent="bg-sky" />
        <StatCard index={3} label="Unread messages" value={newQuotes} note="Synced from contact form" accent="bg-blue dark:bg-sky" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="rounded-3xl border border-line bg-surface p-6">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-6 h-44 w-full" />
            </div>
          ) : (
            <MonthChart data={stats.months} />
          )}
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft lg:col-span-2 sm:p-6">
          <span className="spec-label text-soft">Latest requests</span>
          <ul className="mt-4 space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)
              : db.quotes.slice(0, 5).map((q) => (
                  <li key={q.id} className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-white dark:bg-sky dark:text-[#06172e]">
                      {q.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink dark:text-white">{q.name}</span>
                      <span className="block truncate text-xs text-soft">
                        {q.service} · {new Date(q.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </span>
                    <Pill tone={q.status === "new" ? "spark" : q.status === "closed" ? "muted" : "blue"}>{q.status}</Pill>
                  </li>
                ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

/* ================= testimonials manager ================= */
export function TestimonialsPanel() {
  const db = useDB();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", role: "", quote: "", rating: 5 });
  const [busy, setBusy] = useState(false);

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || form.quote.trim().length < 10) {
      toast("Add a name and a quote of at least 10 characters.", "error");
      return;
    }
    setBusy(true);
    const t: Testimonial = { id: Math.random().toString(36).slice(2, 9), ...form, approved: false, hidden: false };
    admin.upsertTestimonial(t);
    setForm({ name: "", role: "", quote: "", rating: 5 });
    setBusy(false);
    toast("Testimonial added — pending approval.");
  };

  return (
    <Panel>
      <div className="mb-7">
        <span className="spec-label text-blue dark:text-sky">Content</span>
        <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl dark:text-white">Testimonials</h1>
        <p className="mt-1.5 text-sm text-soft">Approve a quote to publish it; hide it to take it off the public carousel.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <form onSubmit={add} className="rounded-3xl border border-line bg-surface p-5 shadow-soft lg:col-span-2 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink dark:text-white">Add testimonial</h2>
          <div className="mt-5 space-y-4">
            <Field label="Client name">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Eng. Moses Okello" />
            </Field>
            <Field label="Role / company">
              <input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Site Manager, Kiryandongo" />
            </Field>
            <Field label="Quote">
              <textarea rows={4} className={`${inputCls} resize-y`} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="What the client said…" />
            </Field>
            <Field label="Rating">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className={`h-10 flex-1 rounded-xl border text-sm font-bold transition-all ${
                      form.rating === n
                        ? "border-spark bg-spark text-[#0B2545]"
                        : "border-line text-soft hover:border-sky"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 dark:bg-sky dark:text-[#06172e]"
          >
            <Plus size={16} /> Add testimonial
          </button>
        </form>

        <ul className="space-y-3 lg:col-span-3">
          {db.testimonials.map((t) => (
            <li key={t.id} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink dark:text-white">{t.name}</p>
                  <p className="text-xs text-soft">{t.role}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone={t.approved ? "green" : "spark"}>{t.approved ? "approved" : "pending"}</Pill>
                  {t.hidden && <Pill tone="muted">hidden</Pill>}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-soft">“{t.quote}”</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <button
                  onClick={() => {
                    admin.upsertTestimonial({ ...t, approved: !t.approved });
                    toast(t.approved ? "Testimonial unapproved." : "Testimonial published.");
                  }}
                  className="rounded-full border border-line px-4 py-2 text-xs font-bold text-soft transition-colors hover:border-blue hover:text-blue"
                >
                  {t.approved ? "Unapprove" : "Approve"}
                </button>
                <button
                  onClick={() => {
                    admin.upsertTestimonial({ ...t, hidden: !t.hidden });
                    toast(t.hidden ? "Visible on site again." : "Hidden from site.", "info");
                  }}
                  className="rounded-full border border-line px-4 py-2 text-xs font-bold text-soft transition-colors hover:border-sky hover:text-blue"
                >
                  {t.hidden ? "Show" : "Hide"}
                </button>
                <button
                  onClick={() => {
                    admin.removeTestimonial(t.id);
                    toast("Testimonial deleted.", "info");
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-spark/40 px-4 py-2 text-xs font-bold text-spark-600 transition-colors hover:bg-spark/10 dark:text-spark"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ================= site settings ================= */
export function SettingsPanel() {
  const db = useDB();
  const toast = useToast();
  const [form, setForm] = useState(db.settings);

  const save = (e: FormEvent) => {
    e.preventDefault();
    admin.saveSettings(form);
    toast("Site settings saved.");
  };

  const req = (key: "phone1" | "phone2") =>
    waLink(form[key], "Hello KIMUNA!");

  return (
    <Panel>
      <div className="mb-7">
        <span className="spec-label text-blue dark:text-sky">Configuration</span>
        <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl dark:text-white">Site settings</h1>
        <p className="mt-1.5 text-sm text-soft">These values feed the public site, the footer and every WhatsApp button.</p>
      </div>

      <form onSubmit={save} className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink dark:text-white">Contact details</h2>
          <div className="mt-5 space-y-4">
            <Field label="Primary phone / WhatsApp" hint="Used by the floating button and quote CTAs.">
              <input className={inputCls} value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
            </Field>
            <Field label="Secondary phone">
              <input className={inputCls} value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Workshop address">
              <textarea rows={3} className={`${inputCls} resize-y`} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink dark:text-white">Social links</h2>
          <div className="mt-5 space-y-4">
            {(["facebook", "instagram", "linkedin", "x"] as const).map((k) => (
              <Field key={k} label={k === "x" ? "X / Twitter" : k.charAt(0).toUpperCase() + k.slice(1)}>
                <input className={inputCls} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </Field>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface-2 p-4 text-xs leading-relaxed text-soft">
            Phone numbers, email and address are translated only for display — the values above stay exactly as typed.
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={req("phone1")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-blue px-3 py-1.5 text-[11px] font-bold text-white">
                <MessageCircle size={12} /> Test WhatsApp
              </a>
              <a href={`mailto:${form.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-bold text-soft">
                <Mail size={12} /> Test email
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-spark px-7 py-3.5 text-sm font-bold text-[#0B2545] transition-transform hover:-translate-y-0.5"
          >
            Save settings <ArrowUpRight size={16} />
          </button>
        </div>
      </form>
    </Panel>
  );
}

export const demoPrice = ugx;
export { ToastHost };
