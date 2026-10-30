import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  Building2,
  Compass,
  Flame,
  Fuel,
  GraduationCap,
  HardHat,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLockBody } from "../lib/hooks";
import { waLink } from "../lib/db";
import { Btn, Reveal, SectionHead, WhatsAppIcon } from "./ui";

export interface ServiceDef {
  id: string;
  icon: LucideIcon;
}

export const SERVICES: ServiceDef[] = [
  { id: "steel", icon: Building2 },
  { id: "welding", icon: Flame },
  { id: "training", icon: GraduationCap },
  { id: "gas", icon: Fuel },
  { id: "safety", icon: ShieldCheck },
  { id: "civil", icon: HardHat },
  { id: "drilling", icon: Compass },
  { id: "furniture", icon: Armchair },
];

export default function Services() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);
  useLockBody(openId !== null);

  const active = SERVICES.find((s) => s.id === openId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="services" className="relative scroll-mt-24 bg-surface-2 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_15%_0%,rgba(77,163,255,0.18),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHead index="02" label={t("services.label")} title={t("services.title")} lead={t("services.lead")} align="split" />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal as="li" key={s.id} delay={(i % 4) * 0.06} y={22}>
                <button
                  onClick={() => setOpenId(s.id)}
                  className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 text-left shadow-soft transition-all duration-400 hover:-translate-y-1.5 hover:border-sky hover:shadow-[0_28px_60px_-30px_rgba(30,90,168,0.6)] focus-visible:border-sky"
                  aria-haspopup="dialog"
                >
                  <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-spark transition-transform duration-500 group-hover:scale-x-100" />
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ice text-blue transition-all duration-400 group-hover:scale-110 group-hover:bg-blue group-hover:text-white dark:bg-deep-3 dark:text-sky dark:group-hover:bg-sky dark:group-hover:text-[#06172e]">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <span className="spec-label mt-5 text-blue/75 dark:text-sky/75">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-[17px] leading-snug font-semibold text-ink dark:text-white">
                    {t(`services.items.${s.id}.title`)}
                  </h3>
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-soft">
                    {t(`services.items.${s.id}.desc`)}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-5 text-[13px] font-semibold text-blue dark:text-sky">
                    {t("services.more")}
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </ul>
      </div>

      {/* detail modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-end overflow-y-auto bg-[#071a33]/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpenId(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            <motion.article
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl rounded-t-[28px] border border-line bg-surface p-6 shadow-soft sm:rounded-[28px] sm:p-9"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue text-white dark:bg-sky dark:text-[#06172e]">
                    <active.icon size={26} strokeWidth={1.75} />
                  </span>
                  <div>
                    <span className="spec-label text-blue dark:text-sky">{t("services.label")}</span>
                    <h3
                      id="service-modal-title"
                      className="font-display text-2xl leading-tight font-bold text-ink dark:text-white"
                    >
                      {t(`services.items.${active.id}.title`)}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setOpenId(null)}
                  aria-label={t("services.close")}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-soft transition-colors hover:border-spark hover:text-spark"
                >
                  <X size={17} />
                </button>
              </div>

              <p className="mt-5 leading-relaxed text-soft">{t(`services.items.${active.id}.desc`)}</p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {(
                  t(`services.items.${active.id}.bullets`, { returnObjects: true }) as string[]
                ).map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink dark:text-white/85"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-spark" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Btn
                  variant="spark"
                  href={waLink(
                    "+256772284451",
                    `Hello KIMUNA, I would like a quote for ${t(`services.items.${active.id}.title`)}.`
                  )}
                  external
                  className="flex-1 justify-center"
                >
                  <WhatsAppIcon />
                  {t("services.enquire")}
                </Btn>
                <Btn variant="ghost" href="#contact" className="flex-1 justify-center">
                  {t("hero.cta1")}
                </Btn>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
