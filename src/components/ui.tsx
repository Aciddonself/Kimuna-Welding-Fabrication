import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../lib/hooks";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img src="/images/kimuna-logo.png" alt="KIMUNA logo" className={className} />
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.6 2 2.17 6.43 2.16 11.87c0 1.74.46 3.44 1.32 4.94L2 22.5l5.83-1.53a9.9 9.9 0 0 0 4.2.94h.01c5.44 0 9.87-4.43 9.88-9.87A9.8 9.8 0 0 0 19.2 5.2 9.8 9.8 0 0 0 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.82.83-3.03-.2-.31a8.16 8.16 0 0 1-1.25-4.36c0-4.53 3.7-8.22 8.23-8.22 2.2 0 4.26.86 5.81 2.41a8.16 8.16 0 0 1 2.41 5.82c0 4.54-3.7 8.2-8.24 8.2Z" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/*  Reveal — scroll-triggered entrance used across the site          */
/* ---------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* ---------------------------------------------------------------- */
/*  SectionHead — the spec-sheet header: index + hairline + title    */
/* ---------------------------------------------------------------- */
export function SectionHead({
  index,
  label,
  title,
  lead,
  align = "left",
  invert = false,
}: {
  index: string;
  label: string;
  title: string;
  lead?: string;
  align?: "left" | "split";
  invert?: boolean;
}) {
  return (
    <header className="mb-12 sm:mb-16">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className={`spec-label ${invert ? "text-sky" : "text-blue dark:text-sky"}`}>{index}</span>
          <span className={`spec-label ${invert ? "text-white/60" : "text-soft"}`}>{label}</span>
          <span className="rule flex-1" aria-hidden="true" />
        </div>
      </Reveal>

      <div className={align === "split" ? "mt-7 grid gap-6 lg:grid-cols-12 lg:gap-10" : "mt-7"}>
        <Reveal delay={0.06} className={align === "split" ? "lg:col-span-7" : ""}>
          <h2
            className={`font-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.03] font-bold ${
              invert ? "text-white" : "text-ink dark:text-white"
            }`}
          >
            {title}
          </h2>
        </Reveal>
        {lead && (
          <Reveal delay={0.12} className={align === "split" ? "lg:col-span-5 lg:pt-3" : "max-w-2xl"}>
            <p className={`text-base leading-relaxed sm:text-lg ${invert ? "text-white/70" : "text-soft"}`}>{lead}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */
/*  Counter — tabular animated figure                               */
/* ---------------------------------------------------------------- */
export function Counter({
  to,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className="tabular">
      {n.toLocaleString("en-UG")}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/*  Buttons                                                          */
/* ---------------------------------------------------------------- */
type BtnProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "spark" | "blue" | "ghost" | "outline";
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<string, string> = {
  spark:
    "bg-spark text-[#0B2545] shadow-[0_14px_34px_-14px_rgba(255,138,31,0.85)] hover:bg-[#ffa04a] hover:-translate-y-0.5 active:translate-y-0",
  blue: "bg-blue text-white shadow-[0_14px_34px_-16px_rgba(30,90,168,0.9)] hover:bg-blue-600 hover:-translate-y-0.5 dark:bg-sky dark:text-[#06172e] dark:hover:bg-[#7abaff]",
  ghost:
    "glass text-ink dark:text-white border border-line hover:border-sky hover:text-blue dark:hover:text-sky",
  outline:
    "border border-white/40 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm",
};

export function Btn({
  children,
  href,
  onClick,
  variant = "spark",
  className = "",
  external,
  type = "button",
  disabled,
  ariaLabel,
}: BtnProps) {
  const cls = `${base} ${variants[variant]} ${className}`;

  // in-page anchors must never fight the router hash, so scroll imperatively
  if (href?.startsWith("#")) {
    return (
      <button
        type={type}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => {
          const id = href.slice(1);
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
          window.location.hash = "/";
          window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 260);
        }}
        className={cls}
      >
        {children}
      </button>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/*  SparkCanvas — welding spatter drifting from the arc              */
/* ---------------------------------------------------------------- */
export function SparkCanvas({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number };
    const parts: P[] = [];
    const origin = () => ({ x: w * 0.72, y: h * 0.58 });

    const spawn = () => {
      const o = origin();
      const a = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 3.4;
      parts.push({
        x: o.x + (Math.random() - 0.5) * 26,
        y: o.y + (Math.random() - 0.5) * 26,
        vx: Math.cos(a) * speed * 1.5,
        vy: Math.sin(a) * speed - 1.1,
        life: 0,
        max: 60 + Math.random() * 90,
        s: 0.7 + Math.random() * 1.7,
      });
    };

    let last = performance.now();
    let acc = 0;

    const frame = (now: number) => {
      const dt = Math.min(34, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);

      acc += dt * 0.06 * density;
      while (acc > 1) {
        spawn();
        acc -= 1;
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt / 16.7;
        p.vy += 0.055 * (dt / 16.7);
        p.vx *= 0.992;
        p.x += p.vx * (dt / 16.7);
        p.y += p.vy * (dt / 16.7);

        const t = p.life / p.max;
        if (t >= 1 || p.y > h + 40) {
          parts.splice(i, 1);
          continue;
        }
        const alpha = (1 - t) * 0.95;
        const warm = t < 0.35;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = warm ? "#FFD9A0" : t < 0.7 ? "#FF8A1F" : "#8FB8E8";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();

        if (warm) {
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = "#FF8A1F";
          ctx.lineWidth = p.s * 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density, reduced]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
