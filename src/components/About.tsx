import { useTranslation } from "react-i18next";
import { Reveal, SectionHead, Counter } from "./ui";

const COUNTER_KEYS = ["projects", "years", "students", "clients"] as const;
const VALUES: { n: number; v: number }[] = [
  { n: 240, v: 0 },
  { n: 12, v: 1 },
  { n: 380, v: 0 },
  { n: 96, v: 0 },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="relative scroll-mt-24 bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHead index="01" label={t("about.label")} title={t("about.title")} align="split" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* image column */}
          <Reveal className="lg:col-span-5" y={34}>
            <figure className="relative">
              <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface-2 shadow-soft">
                <img
                  src="images/training.jpg"
                  alt="KIMUNA trainees welding at practice booths in the Bweyale workshop"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/75 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-[#0B2545]/55 p-4 backdrop-blur-md">
                  <span className="spec-label text-spark">{t("about.missionLabel")}</span>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">{t("about.mission")}</p>
                </figcaption>
              </div>
              <span className="spec-label absolute -top-3 left-6 rounded-full bg-spark px-3 py-1 text-[#0B2545]">
                EST. BWEYALE
              </span>
            </figure>
          </Reveal>

          {/* copy column */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-lg leading-relaxed text-ink sm:text-xl dark:text-white">{t("about.body1")}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 leading-relaxed text-soft">{t("about.body2")}</p>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-8 rounded-3xl border border-blue/15 bg-blue/[0.04] p-6 sm:p-8 dark:border-sky/20 dark:bg-sky/[0.06]">
                <span className="spec-label text-blue dark:text-sky">{t("about.visionLabel")}</span>
                <p className="mt-3 text-lg leading-relaxed text-ink dark:text-white">{t("about.vision")}</p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-5 rounded-3xl border border-line bg-surface-2 p-6 sm:p-8">
                <span className="spec-label text-blue dark:text-sky">{t("about.valuesLabel")}</span>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {(t("about.values", { returnObjects: true }) as string[]).map((v, i) => (
                    <li key={v} className="flex items-start gap-3 text-[15px] text-ink dark:text-white/90">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-spark" aria-hidden="true" />
                      <span>
                        <span className="spec-label mr-2 text-blue/60 dark:text-sky/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {v}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* counters band */}
      <div className="relative mt-20 overflow-hidden bg-blue dark:bg-deep-2 sm:mt-24">
        <div className="blueprint absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-sky/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
            {COUNTER_KEYS.map((k, i) => (
              <Reveal key={k} delay={i * 0.07} className="border-l border-white/25 pl-5 sm:pl-7">
                <dd className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-none font-extrabold text-white">
                  <Counter to={VALUES[i].n} suffix={k === "years" ? "+" : k === "clients" ? "%" : "+"} />
                </dd>
                <dt className="mt-3 text-[13px] leading-snug font-medium tracking-wide text-white/75 uppercase">
                  {t(`about.counters.${k}`)}
                </dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
