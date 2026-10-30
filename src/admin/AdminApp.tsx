import { motion } from "framer-motion";
import {
  Boxes,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings as SettingsIcon,
  ShieldCheck,
  Star,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Logo } from "../components/ui";
import { useDB } from "../lib/db";
import { useTheme } from "../lib/hooks";
import { Field, ToastHost, inputCls, useToast } from "./ui";
import Managers, { TrainingPanel } from "./Managers";
import { ExpiryBar, Overview, SettingsPanel, TestimonialsPanel, login, readSession, type Session } from "./Panels";

/* ================================================================ */
/*  LOGIN                                                            */
/* ================================================================ */
function Login({ onAuth }: { onAuth: (s: Session) => void }) {
  const toast = useToast();
  const [email, setEmail] = useState("admin@kimuna.ug");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [lock, setLock] = useState(0);

  useEffect(() => {
    if (lock <= 0) return;
    const t = window.setInterval(() => setLock((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(t);
  }, [lock]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lock > 0) return;
    setBusy(true);
    setErr("");
    const res = await login(email, password);
    setBusy(false);
    if (res.ok && res.session) {
      toast("Signed in — welcome back.");
      onAuth(res.session);
    } else {
      setErr(res.message);
      if (res.lockSeconds) setLock(res.lockSeconds);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src="images/hero-welding.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(7,26,51,0.95),rgba(30,90,168,0.75))]" />
        <div className="blueprint absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <span className="font-display text-xl font-extrabold tracking-[0.2em]">KIMUNA</span>
          </Link>
          <div>
            <span className="spec-label text-spark">Admin console</span>
            <p className="mt-4 max-w-sm font-display text-3xl leading-tight font-bold">
              QUALITY WELDING AND METAL SERVICES
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Quotes, projects, furniture catalogue, training sign-ups and site settings — one control panel for
              Bweyale workshop operations.
            </p>
          </div>
          <p className="spec-label text-white/40">Diika Road · Bweyale · Kiryandongo</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-surface-2 px-5 py-14">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-[28px] border border-line bg-surface p-7 shadow-soft sm:p-9"
        >
          <div className="flex items-center gap-3 lg:hidden">
            <Logo className="h-9 w-9" />
            <span className="font-display text-lg font-extrabold tracking-[0.2em] text-ink dark:text-white">KIMUNA</span>
          </div>
          <span className="spec-label mt-6 block text-blue dark:text-sky lg:mt-0">Secure sign-in</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink dark:text-white">Admin dashboard</h1>
          <p className="mt-2 text-sm text-soft">JWT session · bcrypt-verified credentials · rate limited.</p>

          <div className="mt-7 space-y-4">
            <Field label="Email">
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-20`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="spec-label absolute top-1/2 right-3 -translate-y-1/2 text-blue dark:text-sky"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </Field>
          </div>

          {err && (
            <p role="alert" className="mt-4 rounded-2xl border border-spark/40 bg-spark/10 px-4 py-3 text-sm font-medium text-spark-600 dark:text-spark">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || lock > 0}
            className="mt-6 w-full rounded-full bg-spark px-6 py-3.5 text-sm font-bold text-[#0B2545] transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {lock > 0 ? `Too many attempts — retry in ${lock}s` : busy ? "Verifying…" : "Sign in"}
          </button>

          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface-2 p-4 text-xs leading-relaxed text-soft">
            <strong className="text-ink dark:text-white">Demo access:</strong> admin@kimuna.ug · kimuna@2026
            <br />
            Session expires after 30 minutes and logs out automatically.
          </div>

          <Link to="/" className="spec-label mt-5 block text-center text-soft transition-colors hover:text-blue">
            ← Back to website
          </Link>
        </motion.form>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  LAYOUT                                                           */
/* ================================================================ */
const NAV = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/quotes", label: "Quote requests", icon: ClipboardList },
  { to: "/admin/projects", label: "Projects", icon: FileText },
  { to: "/admin/products", label: "Furniture / products", icon: Boxes },
  { to: "/admin/training", label: "Training enquiries", icon: ShieldCheck },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/settings", label: "Site settings", icon: SettingsIcon },
];

function Sidebar({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#071a33]/55 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between gap-3 border-b border-line px-5">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="leading-none">
              <span className="font-display block text-base font-extrabold tracking-[0.18em] text-ink dark:text-white">
                KIMUNA
              </span>
              <span className="spec-label text-soft">Admin</span>
            </span>
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-full border border-line text-soft lg:hidden">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue text-white shadow-[0_14px_30px_-18px_rgba(30,90,168,0.95)] dark:bg-sky dark:text-[#06172e]"
                    : "text-soft hover:bg-surface-2 hover:text-blue dark:hover:bg-deep-3 dark:hover:text-sky"
                }`
              }
            >
              <n.icon size={17} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-soft transition-colors hover:bg-spark/10 hover:text-spark-600"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function AdminShell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const db = useDB();
  const unread = useMemo(() => db.quotes.filter((q) => q.status === "new").length, [db.quotes]);

  return (
    <div className="min-h-screen bg-surface-2">
      <Sidebar open={open} onClose={() => setOpen(false)} onLogout={onLogout} />

      <div className="lg:pl-[268px]">
        <header className="glass sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-line px-4 sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink lg:hidden dark:text-white">
            <Menu size={18} />
          </button>
          <div className="hidden sm:block">
            <span className="spec-label block text-soft">KIMUNA control panel</span>
            <span className="text-sm font-semibold text-ink dark:text-white">
              {session.email} · role {session.role}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-soft sm:inline">
              {unread} new request{unread === 1 ? "" : "s"}
            </span>
            <button
              onClick={() => {
                toggle();
                toast(theme === "dark" ? "Light mode on." : "Dark mode on.", "info");
              }}
              aria-label="Toggle theme"
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-soft transition-colors hover:border-sky hover:text-blue"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => {
                onLogout();
                navigate("/admin");
              }}
              className="hidden rounded-full border border-line px-4 py-2 text-xs font-bold text-soft transition-colors hover:border-spark hover:text-spark sm:inline-flex"
            >
              Sign out
            </button>
          </div>
        </header>

        <ExpiryBar session={session} onLogout={onLogout} />

        <main className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="quotes" element={<Managers.Quotes />} />
            <Route path="projects" element={<Managers.Projects />} />
            <Route path="products" element={<Managers.Products />} />
            <Route path="training" element={<TrainingPanel />} />
            <Route path="testimonials" element={<TestimonialsPanel />} />
            <Route path="settings" element={<SettingsPanel />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(() => readSession());

  useEffect(() => {
    if (!session) return;
    const t = window.setInterval(() => {
      if (Date.now() > session.exp) setSession(null);
    }, 5000);
    return () => window.clearInterval(t);
  }, [session]);

  return (
    <ToastHost>
      {session ? (
        <AdminShell session={session} onLogout={() => setSession(null)} />
      ) : (
        <Login onAuth={setSession} />
      )}
    </ToastHost>
  );
}


