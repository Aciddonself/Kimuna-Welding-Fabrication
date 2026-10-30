import { Mail, MapPin, Phone } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { telLink, useDB, waLink } from "../lib/db";
import { Logo } from "./ui";

/* hand-drawn social glyphs — lucide ships no brand marks */
const glyph = "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
function SocialFacebook({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={glyph} />
    </svg>
  );
}
function SocialInstagram({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function SocialLinkedin({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9.75h4v11.25H3zM10 9.75h3.83v1.54h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.1c0-1.22-.02-2.78-1.75-2.78-1.75 0-2.02 1.32-2.02 2.69V21h-4z" />
    </svg>
  );
}
function SocialX({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M17.53 3h3.2l-7 8 8.23 10h-6.44l-5.05-6.11L4.7 21H1.5l7.49-8.56L1.1 3h6.6l4.56 5.66zm-1.12 16.1h1.77L7.68 4.8H5.78z" />
    </svg>
  );
}

const QUICK = ["about", "services", "why", "projects", "training", "contact"] as const;
const SERVICE_IDS = ["steel", "welding", "training", "gas", "safety", "civil", "drilling", "furniture"];

export default function Footer() {
  const { t } = useTranslation();
  const db = useDB();
  const s = db.settings;
  const navigate = useNavigate();
  const location = useLocation();

  const go = (id: string) => {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

  const socials = [
    { icon: SocialFacebook, href: s.facebook, label: "Facebook" },
    { icon: SocialInstagram, href: s.instagram, label: "Instagram" },
    { icon: SocialLinkedin, href: s.linkedin, label: "LinkedIn" },
    { icon: SocialX, href: s.x, label: "X" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#071a33] pt-20 pb-8 text-white">
      <div className="blueprint absolute inset-0 opacity-20" aria-hidden="true" />
      <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-blue/45 blur-[110px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-11" />
              <span>
                <span className="font-display block text-xl font-extrabold tracking-[0.2em]">KIMUNA</span>
                <span className="block text-[9px] font-semibold tracking-[0.18em] text-white/60">{t("slogan")}</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">{t("footer.tagline")}</p>

            <div className="mt-6 flex gap-2.5">
              {socials.map((so) => (
                <a
                  key={so.label}
                  href={so.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={so.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-spark hover:bg-spark hover:text-[#0B2545]"
                >
                  <so.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <nav className="lg:col-span-2" aria-label={t("footer.quickLinks")}>
            <h2 className="spec-label text-spark">{t("footer.quickLinks")}</h2>
            <ul className="mt-4 space-y-2.5">
              {QUICK.map((q) => (
                <li key={q}>
                  <button
                    onClick={() => go(q)}
                    className="text-sm text-white/70 transition-all hover:text-white hover:underline hover:underline-offset-4"
                  >
                    {t(`nav.${q}`)}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/catalogue" className="text-sm text-white/70 transition-colors hover:text-white">
                  {t("nav.catalogue")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="lg:col-span-3" aria-label={t("footer.servicesList")}>
            <h2 className="spec-label text-spark">{t("footer.servicesList")}</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {SERVICE_IDS.map((id) => (
                <li key={id}>
                  <button
                    onClick={() => go("services")}
                    className="text-left text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {t(`services.items.${id}.title`)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="spec-label text-spark">{t("footer.reach")}</h2>
            <ul className="mt-4 space-y-3.5 text-sm text-white/70">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-sky" aria-hidden="true" />
                <span>{t("contact.address")}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-sky" aria-hidden="true" />
                <span className="flex flex-col gap-1">
                  <a href={telLink(s.phone1)} className="transition-colors hover:text-white">
                    {s.phone1}
                  </a>
                  <a href={telLink(s.phone2)} className="transition-colors hover:text-white">
                    {s.phone2}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-sky" aria-hidden="true" />
                <a href={`mailto:${s.email}`} className="break-all transition-colors hover:text-white">
                  {s.email}
                </a>
              </li>
              <li>
                <a
                  href={waLink(s.phone1, "Hello KIMUNA!")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-spark px-4 py-2 text-[13px] font-semibold text-[#0B2545] transition-transform hover:-translate-y-0.5"
                >
                  {t("ui.whatsapp")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} KIMUNA. {t("footer.rights")} {t("footer.note")}
          </p>
          <div className="flex items-center gap-5">
            <span className="spec-label text-white/35">{t("slogan")}</span>
            <Link
              to="/admin"
              className="text-xs text-white/50 underline decoration-white/25 underline-offset-4 transition-colors hover:text-spark"
            >
              {t("footer.admin")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
