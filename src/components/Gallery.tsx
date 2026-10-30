import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDB, type Project, type ProjectCategory } from "../lib/db";
import { useLockBody } from "../lib/hooks";
import { Reveal, SectionHead } from "./ui";

const FILTERS: ("all" | ProjectCategory)[] = ["all", "steel", "fabrication", "furniture", "civil"];

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const { t } = useTranslation();
  const ratios = ["aspect-[4/5]", "aspect-[4/3]", "aspect-[3/4]", "aspect-[16/11]"];
  const ratio = ratios[project.title.length % ratios.length];

  return (
    <button
      onClick={onOpen}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl border border-line bg-surface text-left shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-34px_rgba(30,90,168,0.75)] sm:mb-5"
      aria-label={`${t("projects.open")}: ${project.title}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={`${project.title} — KIMUNA ${t(`projects.filters.${project.category}`)} project in ${project.location}`}
          loading="lazy"
          decoding="async"
          className={`w-full ${ratio} object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071a33]/90 via-[#071a33]/15 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-95" />
        <span className="spec-label absolute top-4 left-4 rounded-full border border-white/25 bg-[#071a33]/60 px-3 py-1 text-white/90 backdrop-blur-md">
          {t(`projects.filters.${project.category}`)}
        </span>
        <span className="absolute top-4 right-4 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-spark text-[#0B2545] opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
          <Maximize2 size={15} />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-lg leading-tight font-semibold text-white">{project.title}</h3>
          <p className="mt-1 text-sm text-white/70">{project.description}</p>
          <p className="spec-label mt-3 text-sky-200">
            {project.location} · {project.year}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function Gallery() {
  const { t } = useTranslation();
  const db = useDB();
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const all = db.projects.filter((p) => p.published);
  const items = filter === "all" ? all : all.filter((p) => p.category === filter);
  const active = openIdx !== null ? items[openIdx] : null;
  useLockBody(openIdx !== null);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowRight") setOpenIdx((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpenIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, items.length]);

  return (
    <section id="projects" className="relative scroll-mt-24 bg-surface-2 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHead index="04" label={t("projects.label")} title={t("projects.title")} lead={t("projects.lead")} align="split" />

        <Reveal>
          <div className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label={t("projects.label")}>
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-300 ${
                  filter === f
                    ? "border-blue bg-blue text-white shadow-[0_12px_30px_-16px_rgba(30,90,168,0.9)] dark:border-sky dark:bg-sky dark:text-[#06172e]"
                    : "border-line bg-surface text-soft hover:border-sky hover:text-blue dark:hover:text-sky"
                }`}
              >
                {t(`projects.filters.${f}`)}
              </button>
            ))}
          </div>
        </Reveal>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface py-20 text-center">
            <p className="text-soft">{t("projects.empty")}</p>
          </div>
        ) : (
          <motion.div layout className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            <AnimatePresence mode="popLayout">
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
                >
                  <ProjectCard project={p} onOpen={() => setOpenIdx(i)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-[#04101f]/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <span className="spec-label text-sky">{t("projects.label")}</span>
              <div className="flex items-center gap-2">
                <span className="spec-label mr-2 text-white/50">
                  {String((openIdx ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
                <button
                  onClick={() => setOpenIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length))}
                  aria-label={t("testimonials.prev")}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition hover:border-spark hover:text-spark"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  onClick={() => setOpenIdx((i) => (i === null ? i : (i + 1) % items.length))}
                  aria-label={t("testimonials.next")}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition hover:border-spark hover:text-spark"
                >
                  <ArrowRight size={17} />
                </button>
                <button
                  onClick={() => setOpenIdx(null)}
                  aria-label={t("projects.close")}
                  className="grid h-10 w-10 place-items-center rounded-full bg-spark text-[#0B2545]"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-5 pb-10 sm:px-8">
              <motion.img
                key={active.id}
                src={active.image}
                alt={active.title}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-h-[62vh] w-auto max-w-full rounded-3xl border border-white/15 object-contain"
              />
              <div className="max-w-2xl text-center">
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{active.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{active.description}</p>
                <p className="spec-label mt-3 text-spark">
                  {t(`projects.filters.${active.category}`)} · {active.location} · {active.year}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
