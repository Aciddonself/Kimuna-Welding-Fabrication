import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LANGS, applyLang } from "../i18n";
import { useLockBody, useScrolled } from "../lib/hooks";
import { waLink } from "../lib/db";
import { Btn, Logo, WhatsAppIcon } from "./ui";

const SECTIONS = [
  { id: "about", key: "about" },
  { id: "services", key: "services" },
  { id: "why", key: "why" },
  { id: "projects", key: "projects" },
  { id: "training", key: "training" },
  { id: "testimonials", key: "testimonials" },
  { id: "contact", key: "contact" },
];

export default function Navbar({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const { t, i18n } = useTranslation();
  const scrolled = useScrolled(20);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("about");
  const [progress, setProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === "/";

  useLockBody(open);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [onHome]);

  const go = (id: string) => {
    setOpen(false);
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

  const setLang = (code: string) => {
    i18n.changeLanguage(code);
    applyLang(code);
  };

  const currentLang = LANGS.find((l) => l.code === i18n.language)?.code ?? "en";

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          // never let the skip link overwrite the router hash
          e.preventDefault();
          const el = document.getElementById("main");
          if (!el) return;
          el.setAttribute("tabindex", "-1");
          el.focus({ preventScroll: true });
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-blue focus:px-5 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "glass shadow-[0_10px_40px_-30px_rgba(11,37,69,0.9)]" : "bg-transparent"
        }`}
      >
        <nav
          className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-4 px-5 sm:px-8"
          aria-label="Primary"
        >
          <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="KIMUNA home">
            <Logo className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[-6deg]" />
            <span className="leading-none">
              <span
                className={`font-display block text-lg font-extrabold tracking-[0.18em] ${
                  scrolled ? "text-ink dark:text-white" : "text-white"
                }`}
              >
                KIMUNA
              </span>
              <span
                className={`hidden text-[9px] font-semibold tracking-[0.2em] sm:block ${
                  scrolled ? "text-soft" : "text-white/75"
                }`}
              >
                {t("slogan")}
              </span>
            </span>
          </Link>

          <div className="mx-auto hidden items-center gap-1 lg:flex">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 ${
                  scrolled
                    ? active === s.id
                      ? "text-blue dark:text-sky"
                      : "text-soft hover:text-blue dark:hover:text-sky"
                    : active === s.id
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                }`}
                aria-current={active === s.id ? "true" : undefined}
              >
                {t(`nav.${s.key}`)}
                {active === s.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-spark"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
            <Link
              to="/catalogue"
              className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                location.pathname === "/catalogue"
                  ? "text-blue dark:text-sky"
                  : scrolled
                    ? "text-soft hover:text-blue"
                    : "text-white/70 hover:text-white"
              }`}
            >
              {t("nav.catalogue")}
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* language */}
            <div
              className="glass flex items-center rounded-full border border-line p-0.5"
              role="group"
              aria-label={t("nav.language")}
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  aria-pressed={currentLang === l.code}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest transition-all ${
                    currentLang === l.code
                      ? "bg-blue text-white dark:bg-sky dark:text-[#06172e]"
                      : "text-soft hover:text-blue dark:hover:text-sky"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              aria-label={t("ui.theme")}
              className={`grid h-9 w-9 place-items-center rounded-full border transition-all ${
                scrolled
                  ? "border-line text-soft hover:border-sky hover:text-blue"
                  : "border-white/30 text-white/85 hover:border-white hover:text-white"
              }`}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="hidden xl:block">
              <Btn variant="spark" onClick={() => go("contact")} className="!px-5 !py-2.5 !text-[13px]">
                {t("nav.quote")}
              </Btn>
            </div>

            <button
              onClick={() => setOpen(true)}
              aria-label={t("nav.menu")}
              aria-expanded={open}
              className={`grid h-9 w-9 place-items-center rounded-full border lg:hidden ${
                scrolled ? "border-line text-ink dark:text-white" : "border-white/30 text-white"
              }`}
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>

        <div className="h-[2px] w-full bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-blue via-sky to-spark transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-ice dark:bg-deep lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
          >
            <div className="blueprint absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="relative flex h-full flex-col px-6 pb-10 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo className="h-9 w-9" />
                  <span className="font-display text-lg font-extrabold tracking-[0.18em] text-ink dark:text-white">
                    KIMUNA
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t("nav.close")}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink dark:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="mt-10 flex-1 overflow-y-auto" aria-label="Mobile">
                <ul className="space-y-1">
                  {[...SECTIONS.map((s) => ({ id: s.id, label: t(`nav.${s.key}`) })), { id: "catalogue", label: t("nav.catalogue") }].map(
                    (item, i) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.045, duration: 0.4 }}
                      >
                        <button
                          onClick={() => (item.id === "catalogue" ? (setOpen(false), navigate("/catalogue")) : go(item.id))}
                          className="group flex w-full items-baseline gap-4 border-b border-line py-4 text-left"
                        >
                          <span className="spec-label text-blue dark:text-sky">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-display text-2xl font-semibold text-ink transition-colors group-hover:text-blue dark:text-white dark:group-hover:text-sky">
                            {item.label}
                          </span>
                        </button>
                      </motion.li>
                    )
                  )}
                </ul>
              </nav>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex-1 rounded-full border px-4 py-2.5 text-xs font-bold tracking-widest transition-all ${
                        currentLang === l.code
                          ? "border-blue bg-blue text-white dark:border-sky dark:bg-sky dark:text-[#06172e]"
                          : "border-line text-soft"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <Btn variant="spark" onClick={() => go("contact")}>
                  {t("hero.cta1")}
                </Btn>
                <Btn
                  variant="ghost"
                  href={waLink("+256772284451", `Hello KIMUNA, I'd like a quote.`)}
                  external
                  className="justify-center"
                >
                  <WhatsAppIcon />
                  {t("hero.cta2")}
                </Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
