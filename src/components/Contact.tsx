import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { submitQuote, submitTraining, telLink, waLink, useDB } from "../lib/db";
import { Btn, Reveal, SectionHead, WhatsAppIcon } from "./ui";

type Fields = { name: string; phone: string; email: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const SERVICE_IDS = ["steel", "welding", "training", "gas", "safety", "civil", "drilling", "furniture"];

export default function Contact() {
  const { t } = useTranslation();
  const db = useDB();
  const settings = db.settings;
  const [form, setForm] = useState<Fields>({ name: "", phone: "", email: "", service: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setForm((f) => ({ ...f, service: detail }));
      setSent(false);
    };
    window.addEventListener("kimuna:select-service", onSelect);
    return () => window.removeEventListener("kimuna:select-service", onSelect);
  }, []);

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = (v: Fields): Errors => {
    const err: Errors = {};
    if (v.name.trim().length < 3) err.name = t("contact.errors.name");
    if (!/^\+?[\d\s-]{9,15}$/.test(v.phone.trim())) err.phone = t("contact.errors.phone");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) err.email = t("contact.errors.email");
    if (!v.service) err.service = t("contact.errors.service");
    if (v.message.trim().length < 10) err.message = t("contact.errors.message");
    return err;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    setErrors(err);
    if (Object.keys(err).length) {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setSending(true);
    try {
      submitQuote(form);
      // training requests also land in the admin training-enquiries manager
      if (form.service === "training" || form.service === "safety") {
        submitTraining({
          name: form.name,
          phone: form.phone,
          email: form.email,
          programme: form.service === "training" ? "technical" : "safety",
          cohort: new Date().toLocaleString("en", { month: "long", year: "numeric" }),
        });
      }
      // POST /api/quotes — server persists to Supabase and emails kqualityw@gmail.com
      const api = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL;
      if (api) {
        await fetch(`${api}/api/quotes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setSent(true);
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    } catch {
      setErrors({ message: "Network error — please WhatsApp us instead." });
    } finally {
      setSending(false);
    }
  };

  const fieldCls = (bad?: string) =>
    `w-full rounded-2xl border bg-surface px-4 py-3.5 text-[15px] text-ink outline-none transition-all duration-200 placeholder:text-soft focus:border-sky focus:ring-4 focus:ring-sky/15 dark:text-white ${
      bad ? "border-spark" : "border-line"
    }`;

  return (
    <section id="contact" className="relative scroll-mt-24 bg-surface-2 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHead index="07" label={t("contact.label")} title={t("contact.title")} lead={t("contact.lead")} align="split" />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* details + map */}
          <div className="lg:col-span-5">
            <Reveal>
              <ul className="space-y-3">
                <li className="group flex items-start gap-4 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-sky">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ice text-blue transition-colors group-hover:bg-blue group-hover:text-white dark:bg-deep-3 dark:text-sky">
                    <MapPin size={19} />
                  </span>
                  <span>
                    <span className="spec-label block text-blue dark:text-sky">{t("contact.visit")}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink dark:text-white/90">
                      {t("contact.address")}
                    </span>
                  </span>
                </li>

                <li className="rounded-3xl border border-line bg-surface p-5">
                  <span className="spec-label block text-blue dark:text-sky">{t("contact.call")}</span>
                  <div className="mt-3 flex flex-col gap-2">
                    {[settings.phone1, settings.phone2].map((p) => (
                      <div key={p} className="flex gap-2">
                        <a
                          href={telLink(p)}
                          className="flex-1 rounded-2xl border border-line px-4 py-3 text-[15px] font-semibold text-ink transition-all hover:border-blue hover:text-blue dark:text-white dark:hover:text-sky"
                        >
                          {p}
                        </a>
                        <a
                          href={waLink(p, "Hello KIMUNA!")}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${t("ui.whatsapp")} ${p}`}
                          className="grid h-[46px] w-[46px] place-items-center rounded-2xl bg-blue text-white transition-all hover:bg-blue-600 dark:bg-sky dark:text-[#06172e]"
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </li>

                <li className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ice text-blue dark:bg-deep-3 dark:text-sky">
                    <Mail size={19} />
                  </span>
                  <span>
                    <span className="spec-label block text-blue dark:text-sky">{t("contact.email")}</span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="mt-1 block break-all text-[15px] font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-blue dark:text-white dark:decoration-white/25"
                    >
                      {settings.email}
                    </a>
                  </span>
                </li>

                <li className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ice text-blue dark:bg-deep-3 dark:text-sky">
                    <Clock size={19} />
                  </span>
                  <span>
                    <span className="spec-label block text-blue dark:text-sky">{t("contact.hoursLabel")}</span>
                    <span className="mt-1 block text-[15px] text-ink dark:text-white/90">{t("contact.hours")}</span>
                  </span>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
                <iframe
                  title={t("contact.mapTitle")}
                  src="https://www.google.com/maps?q=Diika%20Road%2C%20Bweyale%20Town%20Council%2C%20Kiryandongo%20District%2C%20Uganda&z=13&output=embed"
                  className="h-[280px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Diika+Road,+Bweyale+Town+Council,+Kiryandongo+District,+Uganda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spec-label block px-5 py-3.5 text-blue transition-colors hover:bg-ice dark:text-sky dark:hover:bg-deep-3"
                >
                  {t("contact.mapLink")} →
                </a>
              </div>
            </Reveal>
          </div>

          {/* form */}
          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <div className="relative rounded-[28px] border border-line bg-surface p-6 shadow-soft sm:p-9">
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="ok"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex min-h-[420px] flex-col items-center justify-center text-center"
                      role="status"
                    >
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-blue text-white dark:bg-sky dark:text-[#06172e]">
                        <CheckCircle2 size={30} />
                      </span>
                      <h3 className="mt-6 font-display text-2xl font-bold text-ink dark:text-white">
                        {t("contact.successTitle")}
                      </h3>
                      <p className="mt-3 max-w-md leading-relaxed text-soft">{t("contact.successBody")}</p>
                      <div className="mt-7 flex flex-wrap justify-center gap-3">
                        <Btn variant="ghost" onClick={() => setSent(false)}>
                          {t("contact.successAgain")}
                        </Btn>
                        <Btn variant="spark" href={waLink(settings.phone1, "Hello KIMUNA!")} external>
                          <WhatsAppIcon />
                          {t("contact.whatsapp")}
                        </Btn>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={onSubmit}
                      noValidate
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="spec-label text-blue dark:text-sky">{t("contact.label")}</span>
                      <h3 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl dark:text-white">
                        {t("contact.formTitle")}
                      </h3>

                      <div className="mt-7 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="q-name" className="spec-label mb-2 block text-soft">
                            {t("contact.fields.name")} <span className="text-spark">*</span>
                          </label>
                          <input
                            id="q-name"
                            value={form.name}
                            onChange={set("name")}
                            placeholder={t("contact.placeholder.name")}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? "err-name" : undefined}
                            className={fieldCls(errors.name)}
                          />
                          {errors.name && <p id="err-name" className="mt-1.5 text-xs font-medium text-spark-600 dark:text-spark">{errors.name}</p>}
                        </div>

                        <div>
                          <label htmlFor="q-phone" className="spec-label mb-2 block text-soft">
                            {t("contact.fields.phone")} <span className="text-spark">*</span>
                          </label>
                          <input
                            id="q-phone"
                            type="tel"
                            inputMode="tel"
                            value={form.phone}
                            onChange={set("phone")}
                            placeholder={t("contact.placeholder.phone")}
                            aria-invalid={!!errors.phone}
                            aria-describedby={errors.phone ? "err-phone" : undefined}
                            className={fieldCls(errors.phone)}
                          />
                          {errors.phone && <p id="err-phone" className="mt-1.5 text-xs font-medium text-spark-600 dark:text-spark">{errors.phone}</p>}
                        </div>

                        <div>
                          <label htmlFor="q-email" className="spec-label mb-2 block text-soft">
                            {t("contact.fields.email")} <span className="text-spark">*</span>
                          </label>
                          <input
                            id="q-email"
                            type="email"
                            value={form.email}
                            onChange={set("email")}
                            placeholder={t("contact.placeholder.email")}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "err-email" : undefined}
                            className={fieldCls(errors.email)}
                          />
                          {errors.email && <p id="err-email" className="mt-1.5 text-xs font-medium text-spark-600 dark:text-spark">{errors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="q-service" className="spec-label mb-2 block text-soft">
                            {t("contact.fields.service")} <span className="text-spark">*</span>
                          </label>
                          <select
                            id="q-service"
                            value={form.service}
                            onChange={set("service")}
                            aria-invalid={!!errors.service}
                            aria-describedby={errors.service ? "err-service" : undefined}
                            className={fieldCls(errors.service)}
                          >
                            <option value="">{t("contact.select")}</option>
                            {SERVICE_IDS.map((id) => (
                              <option key={id} value={id}>
                                {t(`services.items.${id}.title`)}
                              </option>
                            ))}
                          </select>
                          {errors.service && <p id="err-service" className="mt-1.5 text-xs font-medium text-spark-600 dark:text-spark">{errors.service}</p>}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label htmlFor="q-message" className="spec-label mb-2 block text-soft">
                          {t("contact.fields.message")} <span className="text-spark">*</span>
                        </label>
                        <textarea
                          id="q-message"
                          rows={5}
                          value={form.message}
                          onChange={set("message")}
                          placeholder={t("contact.placeholder.message")}
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? "err-message" : undefined}
                          className={`${fieldCls(errors.message)} resize-y`}
                        />
                        {errors.message && <p id="err-message" className="mt-1.5 text-xs font-medium text-spark-600 dark:text-spark">{errors.message}</p>}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Btn type="submit" variant="spark" disabled={sending} className="sm:px-8">
                          {sending ? t("contact.sending") : t("contact.submit")}
                          {!sending && <Send size={16} className="transition-transform group-hover:translate-x-1" />}
                        </Btn>
                        <a
                          href={waLink(settings.phone2, "Hello KIMUNA, I need a quote.")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2.5 rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:border-blue hover:text-blue dark:text-white dark:hover:text-sky"
                        >
                          <WhatsAppIcon />
                          {t("contact.whatsapp")}
                        </a>
                        <span className="spec-label text-soft/70">
                          <Phone size={12} className="mr-1 inline" />
                          {t("contact.fields.phone")} · {t("contact.required")}
                        </span>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
