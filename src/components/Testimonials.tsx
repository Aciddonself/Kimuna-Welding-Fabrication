import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDB } from "../lib/db";
import { usePrefersReducedMotion } from "../lib/hooks";
import { Reveal, SectionHead } from "./ui";

export default function Testimonials() {
  const { t } = useTranslation();
  const db = useDB();
  const reduced = usePrefersReducedMotion();
  const items = db.testimonials.filter((x) => x.approved && !x.hidden);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (next: number) => {
      if (!items.length) return;
      setDir(next > 0 ? 1 : -1);
      setI((prev) => (prev + next + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => setI(0), [items.length]);

  useEffect(() => {
    if (reduced || items.length < 2) return;
    const id = setInterval(() => go(1), 6500);
    return () => clearInterval(id);
  }, [go, items.length, reduced]);

  const active = items[i];

  return (
    <section id="testimonials" className="relative scroll-mt-24 bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHead index="06" label={t("testimonials.label")} title={t("testimonials.title")} />

        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface-2 p-7 shadow-soft sm:p-10">
              <Quote size={64} className="absolute -top-4 right-6 text-sky/25" aria-hidden="true" />
              <AnimatePresence mode="wait" custom={dir}>
                {active && (
                  <motion.figure
                    key={active.id}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex gap-1" aria-label={`${active.rating} / 5`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          size={16}
                          className={s < active.rating ? "fill-spark text-spark" : "text-line"}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="mt-5 font-display text-xl leading-[1.45] font-medium text-ink sm:text-2xl dark:text-white">
                      “{active.quote}”
                    </blockquote>
                    <figcaption className="mt-7 flex items-center gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-blue font-display text-lg font-bold text-white dark:bg-sky dark:text-[#06172e]">
                        {active.name.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink dark:text-white">{active.name}</span>
                        <span className="block text-[13px] text-soft">{active.role}</span>
                      </span>
                    </figcaption>
                  </motion.figure>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
                <span className="spec-label text-soft tabular">
                  {String(i + 1).padStart(2, "0")} {t("testimonials.of")} {String(items.length).padStart(2, "0")}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => go(-1)}
                    aria-label={t("testimonials.prev")}
                    className="grid h-11 w-11 place-items-center rounded-full border border-line text-soft transition-all hover:border-spark hover:text-spark"
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label={t("testimonials.next")}
                    className="grid h-11 w-11 place-items-center rounded-full border border-line text-soft transition-all hover:border-spark hover:text-spark"
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-4">
            <ul className="flex flex-wrap gap-2 lg:flex-col">
              {items.map((x, idx) => (
                <Reveal as="li" key={x.id} delay={idx * 0.05} className="w-full">
                  <button
                    onClick={() => {
                      setDir(idx > i ? 1 : -1);
                      setI(idx);
                    }}
                    className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                      idx === i
                        ? "border-blue bg-blue text-white dark:border-sky dark:bg-sky dark:text-[#06172e]"
                        : "border-line bg-surface text-soft hover:border-sky hover:text-blue dark:hover:text-sky"
                    }`}
                    aria-current={idx === i ? "true" : undefined}
                  >
                    <span className="block truncate text-sm font-semibold">{x.name}</span>
                    <span className={`block truncate text-xs ${idx === i ? "text-white/80" : "text-soft"}`}>
                      {x.role}
                    </span>
                  </button>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
