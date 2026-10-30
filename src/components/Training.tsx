import { Check, Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Btn, Reveal, SectionHead, WhatsAppIcon } from "./ui";
import { waLink } from "../lib/db";

function selectService(service: string) {
  window.dispatchEvent(new CustomEvent("kimuna:select-service", { detail: service }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Training() {
  const { t } = useTranslation();

  const programmes = [
    {
      key: "tech",
      title: t("training.techTitle"),
      desc: t("training.techDesc"),
      points: t("training.techPoints", { returnObjects: true }) as string[],
      accent: "bg-blue dark:bg-sky",
    },
    {
      key: "safety",
      title: t("training.safetyTitle"),
      desc: t("training.safetyDesc"),
      points: t("training.safetyPoints", { returnObjects: true }) as string[],
      accent: "bg-spark",
    },
  ];

  return (
    <section id="training" className="relative scroll-mt-24 overflow-hidden bg-[#071a33] py-24 sm:py-32">
      <div className="blueprint absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue/40 blur-[120px]" aria-hidden="true" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-spark/20 blur-[110px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHead index="05" label={t("training.label")} title={t("training.title")} lead={t("training.lead")} align="split" invert />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-7">
            <div className="grid gap-5 sm:grid-cols-2">
              {programmes.map((p) => (
                <article
                  key={p.key}
                  className="group flex flex-col rounded-3xl border border-white/12 bg-white/[0.05] p-6 backdrop-blur-md transition-all duration-400 hover:-translate-y-1 hover:border-sky/50 hover:bg-white/[0.08]"
                >
                  <span className={`mb-5 h-1 w-12 rounded-full ${p.accent}`} aria-hidden="true" />
                  <h3 className="font-display text-xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{p.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-white/85">
                        <Check size={15} className="mt-0.5 shrink-0 text-spark" aria-hidden="true" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4">
                    <span className="flex items-center gap-2 text-xs text-white/60">
                      <Clock size={13} aria-hidden="true" />
                      {t("training.duration")}: <strong className="font-semibold text-white/90">{t("training.durationValue")}</strong>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-white/60">
                      <MapPin size={13} aria-hidden="true" />
                      {t("training.mode")}: <strong className="font-semibold text-white/90">{t("training.modeValue")}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="relative h-full overflow-hidden rounded-[28px] border border-white/12">
              <img
                src="images/training.jpg"
                alt="KIMUNA technical and health &amp; safety training session at the Bweyale workshop"
                loading="lazy"
                decoding="async"
                className="h-full min-h-[320px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071a33] via-[#071a33]/55 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <span className="spec-label inline-flex rounded-full bg-spark px-3 py-1 text-[#0B2545]">
                  {t("training.spots")}
                </span>
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <Btn variant="spark" onClick={() => selectService("training")} className="flex-1 justify-center">
                    {t("training.enquire")}
                  </Btn>
                  <Btn
                    variant="outline"
                    href={waLink("+256772284451", `Hello KIMUNA, I want to join the ${t("training.techTitle")} programme.`)}
                    external
                    className="flex-1 justify-center"
                  >
                    <WhatsAppIcon />
                    {t("nav.quote")}
                  </Btn>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
