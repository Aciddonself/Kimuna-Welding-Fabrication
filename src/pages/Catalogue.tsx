import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ugx, useDB, waLink, type Product } from "../lib/db";
import { Btn, Reveal, SectionHead, WhatsAppIcon } from "../components/ui";

type Cat = "all" | Product["category"];
const CATS: Cat[] = ["all", "office", "home", "hospitality", "school"];

export default function Catalogue() {
  const { t } = useTranslation();
  const db = useDB();
  const [cat, setCat] = useState<Cat>("all");
  const items = cat === "all" ? db.products : db.products.filter((p) => p.category === cat);

  return (
    <main id="main" className="bg-surface-2 pt-[72px]">
      <section className="relative overflow-hidden bg-[#071a33] py-16 sm:py-20">
        <div className="blueprint absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-blue/50 blur-[100px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
          <Link
            to="/"
            className="spec-label inline-flex items-center gap-2 text-white/60 transition-colors hover:text-spark"
          >
            <ArrowLeft size={13} /> {t("catalogue.back")}
          </Link>
          <span className="spec-label mt-6 block text-spark">{t("catalogue.label")}</span>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.02] font-extrabold text-white">
            {t("catalogue.title")}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-white/70">{t("catalogue.lead")}</p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <SectionHead index="—" label={t("nav.catalogue")} title={t("catalogue.title")} />

          <div className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1" role="tablist">
            {CATS.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all ${
                  cat === c
                    ? "border-blue bg-blue text-white dark:border-sky dark:bg-sky dark:text-[#06172e]"
                    : "border-line bg-surface text-soft hover:border-sky hover:text-blue dark:hover:text-sky"
                }`}
              >
                {c === "all" ? t("catalogue.all") : t(`catalogue.filters.${c}`)}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line bg-surface py-20 text-center text-soft">
              {t("catalogue.empty")}
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 0.06}>
                  <motion.article
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={p.image}
                        alt={`${p.name} — KIMUNA ${t(`catalogue.filters.${p.category}`)} furniture`}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span
                        className={`spec-label absolute top-3 left-3 rounded-full px-3 py-1 ${
                          p.stock ? "bg-blue text-white dark:bg-sky dark:text-[#06172e]" : "bg-spark text-[#0B2545]"
                        }`}
                      >
                        {p.stock ? t("catalogue.inStock") : t("catalogue.outOfStock")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="spec-label text-blue/60 dark:text-sky/60">
                        {t(`catalogue.filters.${p.category}`)}
                      </span>
                      <h3 className="mt-2 font-display text-lg font-semibold text-ink dark:text-white">{p.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-soft">{p.description}</p>
                      <p className="font-display mt-4 text-xl font-bold text-blue tabular dark:text-sky">{ugx(p.price)}</p>
                      <div className="mt-5 pt-1">
                        <Btn
                          variant="spark"
                          href={waLink(
                            "+256772284451",
                            `Hello KIMUNA, I would like to order: ${p.name} (${ugx(p.price)}).`
                          )}
                          external
                          className="w-full justify-center"
                        >
                          <WhatsAppIcon />
                          {t("catalogue.order")}
                        </Btn>
                      </div>
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
