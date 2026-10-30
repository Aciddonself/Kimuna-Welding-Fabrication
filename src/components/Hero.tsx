import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { waLink } from "../lib/db";
import { Btn, SparkCanvas, WhatsAppIcon } from "./ui";

const PILLARS = ["expertise", "fabrication", "welding", "quality"] as const;

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section id="home" className="relative isolate min-h-[100svh] overflow-hidden bg-[#071a33]">
      {/* photographic base */}
      <img
        src="images/hero-welding.jpg"
        alt="KIMUNA welder sending a shower of sparks while joining a steel I-beam in the Bweyale workshop"
        className="absolute inset-0 h-full w-full object-cover object-[65%_center] opacity-70"
        fetchPriority="high"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,26,51,0.96)_0%,rgba(11,37,69,0.86)_38%,rgba(30,90,168,0.55)_72%,rgba(77,163,255,0.35)_100%)]"
        aria-hidden="true"
      />
      <div className="blueprint absolute inset-0 opacity-30 mix-blend-soft-light" aria-hidden="true" />
      <SparkCanvas />

      {/* vertical spine — slogan always in capitals */}
      <div
        className="pointer-events-none absolute top-1/2 left-4 hidden -translate-y-1/2 xl:block"
        aria-hidden="true"
      >
        <span className="block rotate-180 text-[10px] font-semibold tracking-[0.55em] text-white/35 [writing-mode:vertical-rl]">
          {t("slogan")}
        </span>
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pt-28 pb-0 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="spec-label flex items-center gap-3 text-sky-200"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-spark" />
          {t("hero.eyebrow")}
        </motion.p>

        <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.75rem,8.5vw,7rem)] leading-[0.94] font-extrabold tracking-[-0.03em] text-white">
          <motion.span
            className="block overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01, delay: 0.2 }}
          >
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("hero.line1")}
            </motion.span>
          </motion.span>
          <motion.span className="block overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.01, delay: 0.35 }}>
            <motion.span
              className="block text-sky"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("hero.line2")}
            </motion.span>
          </motion.span>
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:col-span-6"
          >
            {t("hero.lead")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.72 }}
            className="flex flex-wrap items-center gap-3 lg:col-span-6 lg:justify-end"
          >
            <Btn variant="spark" href="#contact" ariaLabel={t("hero.cta1")}>
              {t("hero.cta1")}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Btn>
            <Btn variant="outline" href={waLink("+256772284451", "Hello KIMUNA, I'd like a quote.")} external>
              <WhatsAppIcon />
              {t("hero.cta2")}
            </Btn>
          </motion.div>
        </div>

        {/* pillar strip */}
        <motion.ul
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-10 grid grid-cols-2 border-t border-white/15 sm:grid-cols-4"
          aria-label="KIMUNA pillars"
        >
          {PILLARS.map((p, i) => (
            <li
              key={p}
              className="group relative flex items-baseline gap-3 border-b border-white/10 px-1 py-5 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-5 sm:py-7"
            >
              <span className="spec-label text-spark">{`0${i + 1}`}</span>
              <span className="font-display text-base font-semibold tracking-wide text-white uppercase transition-colors duration-300 group-hover:text-sky sm:text-xl">
                {t(`pillars.${p}`)}
              </span>
              <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-spark transition-transform duration-500 group-hover:scale-x-100" />
            </li>
          ))}
        </motion.ul>

        <div className="hidden items-center gap-3 py-6 text-white/50 md:flex">
          <ArrowDown size={14} className="animate-bounce" />
          <span className="spec-label">{t("hero.scroll")}</span>
        </div>
      </div>
    </section>
  );
}
