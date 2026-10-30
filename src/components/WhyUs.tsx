import { useTranslation } from "react-i18next";
import { Reveal, SectionHead } from "./ui";

const KEYS = ["expertise", "quality", "safety", "reliability", "pricing"] as const;

export default function WhyUs() {
  const { t } = useTranslation();

  return (
    <section id="why" className="relative scroll-mt-24 overflow-hidden bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* sticky rail — the asymmetric split */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHead index="03" label={t("why.label")} title={t("why.title")} />
              <Reveal delay={0.12}>
                <div className="hidden rounded-3xl border border-line bg-surface-2 p-6 lg:block">
                  <p className="text-sm leading-relaxed text-soft">{t("about.body1")}</p>
                  <div className="mt-5 h-px w-full bg-[var(--border)]" />
                  <p className="spec-label mt-4 text-blue dark:text-sky">ISO-STD · WPS · PPE</p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* rows, not cards */}
          <ul className="lg:col-span-8">
            {KEYS.map((k, i) => (
              <Reveal as="li" key={k} delay={i * 0.06}>
                <article className="group relative grid grid-cols-[auto_1fr] items-start gap-5 border-t border-line py-7 transition-colors duration-300 last:border-b sm:gap-8 sm:py-9">
                  <span className="absolute inset-y-0 -left-4 w-[3px] origin-top scale-y-0 bg-spark transition-transform duration-500 group-hover:scale-y-100" aria-hidden="true" />
                  <span className="font-display text-3xl font-extrabold text-line transition-colors duration-300 group-hover:text-blue sm:text-5xl dark:text-deep-3 dark:group-hover:text-sky">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl dark:text-white">
                      {t(`why.items.${k}.title`)}
                    </h3>
                    <p className="mt-2 max-w-2xl leading-relaxed text-soft">{t(`why.items.${k}.desc`)}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
