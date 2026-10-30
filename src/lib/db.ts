import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/*  KIMUNA data layer.                                                 */
/*  Mirrors the Express + Supabase API in /server — every function     */
/*  below maps 1:1 to a REST endpoint, so swapping the transport is a  */
/*  single-file change (see src/lib/api-client.ts note in README).     */
/* ------------------------------------------------------------------ */

export type ProjectCategory = "steel" | "fabrication" | "furniture" | "civil";
export type QuoteStatus = "new" | "contacted" | "quoted" | "closed";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  image: string;
  location: string;
  year: string;
  published: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "office" | "home" | "hospitality" | "school";
  stock: boolean;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  approved: boolean;
  hidden: boolean;
  rating: number;
}

export interface Quote {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: QuoteStatus;
  notes: string;
}

export interface TrainingEnquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  programme: "technical" | "safety";
  cohort: string;
  status: "new" | "contacted" | "enrolled";
}

export interface Settings {
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  x: string;
}

export interface DB {
  projects: Project[];
  products: Product[];
  testimonials: Testimonial[];
  quotes: Quote[];
  training: TrainingEnquiry[];
  settings: Settings;
  messages: number;
}

const IMG = {
  hero: "images/hero-welding.jpg",
  steel: "images/proj-steel.jpg",
  fab: "images/proj-fabrication.jpg",
  furn: "images/proj-furniture.jpg",
  civil: "images/proj-civil.jpg",
  training: "images/training.jpg",
  gas: "images/gas-industrial.jpg",
};

export const IMAGES = IMG;

const seed: DB = {
  projects: [
    { id: "p1", title: "Bweyale Grain Warehouse Frame", description: "1,200 m² portal-frame warehouse with purlins, bracing and a corrugated roof, erected in eleven working days.", category: "steel", image: IMG.steel, location: "Bweyale, Kiryandongo", year: "2025", published: true },
    { id: "p2", title: "Kiryandongo Market Stalls", description: "Fabricated steel stall frames, lockable shutters and canopy roofing for a public market block.", category: "steel", image: IMG.fab, location: "Kiryandongo", year: "2025", published: true },
    { id: "p3", title: "Stainless Water Tank Series", description: "304-grade stainless tanks from 500 L to 2,000 L, TIG welded and pressure tested before delivery.", category: "fabrication", image: IMG.fab, location: "Masindi", year: "2024", published: true },
    { id: "p4", title: "Steel Gate & Grill Package", description: "Sliding driveway gate, security grilles and balcony railings finished with zinc primer and enamel.", category: "fabrication", image: IMG.hero, location: "Bweyale", year: "2025", published: true },
    { id: "p5", title: "Powder-Coated Office Desks", description: "Steel-frame desks with hardwood tops, supplied in batches to a district offices fit-out.", category: "furniture", image: IMG.furn, location: "Lira", year: "2024", published: true },
    { id: "p6", title: "Lounge Seating, Custom Run", description: "Bespoke steel-frame lounge chairs with woven backs for a lake-side restaurant.", category: "furniture", image: IMG.furn, location: "Lakeside", year: "2025", published: true },
    { id: "p7", title: "Diika Road Drainage Culvert", description: "Reinforced concrete culvert, headwalls and compaction on a 320 m access road section.", category: "civil", image: IMG.civil, location: "Bweyale", year: "2025", published: true },
    { id: "p8", title: "Workshop Slab & Foundation Works", description: "Blinding, mesh reinforcement and slab casting for a 240 m² fabrication workshop.", category: "civil", image: IMG.training, location: "Kiryandongo", year: "2024", published: true },
  ],
  products: [
    { id: "s1", name: "Steel-frame Office Desk", price: 385000, image: IMG.furn, category: "office", stock: true, description: "1400 × 700 mm, black powder-coated frame, 18 mm hardwood top." },
    { id: "s2", name: "Welded Guest Chair", price: 145000, image: IMG.furn, category: "office", stock: true, description: "Stackable, chrome-plated frame with cushioned seat." },
    { id: "s3", name: "Bunk Bed, Steel", price: 620000, image: IMG.furn, category: "home", stock: true, description: "Two-tier steel bunk, guard rails, enamel finish." },
    { id: "s4", name: "Restaurant Table Set", price: 890000, image: IMG.furn, category: "hospitality", stock: false, description: "Four chairs and one table, made to order in 10 working days." },
    { id: "s5", name: "School Desk & Bench", price: 210000, image: IMG.furn, category: "school", stock: true, description: "Dual-seat desk, galvanised frame, plywood top." },
    { id: "s6", name: "Kitchen Shelf Unit", price: 275000, image: IMG.fab, category: "home", stock: true, description: "Four-tier steel shelving, 1800 mm high, welded joints." },
  ],
  testimonials: [
    { id: "t1", name: "Eng. Moses Okello", role: "Site Manager, Kiryandongo", quote: "The warehouse frame went up on the date they gave us and the inspection passed first time. KIMUNA communicate early and work clean.", approved: true, hidden: false, rating: 5 },
    { id: "t2", name: "Sarah Namutebi", role: "School Administrator", quote: "We commissioned 40 desks and two security gates. Finish was consistent across every piece and delivery to Bweyale was on time.", approved: true, hidden: false, rating: 5 },
    { id: "t3", name: "Patrick Walakira", role: "Hardware Owner, Masindi", quote: "Their welding training gave our apprentices real shop-floor skills. Six months on, two of them run our fabrication bench.", approved: true, hidden: false, rating: 5 },
    { id: "t4", name: "Aciro Beatrice", role: "Hotel Procurement", quote: "Fair quote, no surprises at the end, and the chairs still look new after a busy season. We now order every quarter.", approved: true, hidden: false, rating: 4 },
  ],
  quotes: [
    { id: "q1", createdAt: "2026-01-08T09:14:00.000Z", name: "Brian Opoka", phone: "+256 772 118 903", email: "brian.opoka@gmail.com", service: "steel", message: "Need a 15 × 24 m warehouse frame with two roller doors in Bweyale.", status: "new", notes: "" },
    { id: "q2", createdAt: "2026-01-12T14:02:00.000Z", name: "Doreen Auma", phone: "+256 791 442 006", email: "doreen.auma@outlook.com", service: "furniture", message: "20 school desks for a new wing, delivery to Kiryandongo town.", status: "contacted", notes: "Sent photos of the standard desk; awaiting school sign-off." },
    { id: "q3", createdAt: "2026-01-19T11:47:00.000Z", name: "John Baptiste", phone: "+256 701 335 512", email: "jbaptiste@yahoo.com", service: "civil", message: "Culvert and drainage for 200 m of access road.", status: "quoted", notes: "Quote KQ-0142 issued at 8,400,000 UGX." },
    { id: "q4", createdAt: "2026-02-02T08:30:00.000Z", name: "Grace Atim", phone: "+256 752 909 774", email: "grace.atim@gmail.com", service: "training", message: "Three staff need the health & safety course in February.", status: "new", notes: "" },
    { id: "q5", createdAt: "2026-02-11T16:20:00.000Z", name: "Hamza Ssekandi", phone: "+256 774 620 118", email: "hamza.ssekandi@gmail.com", service: "gas", message: "Weekly oxygen and acetylene refill account for our garage.", status: "closed", notes: "Account opened; deliveries every Tuesday." },
  ],
  training: [
    { id: "e1", createdAt: "2026-01-15T10:05:00.000Z", name: "Isaac Mugisha", phone: "+256 782 551 210", email: "isaac.mugisha@gmail.com", programme: "technical", cohort: "March 2026", status: "enrolled" },
    { id: "e2", createdAt: "2026-01-28T13:40:00.000Z", name: "Prossy Nabwire", phone: "+256 751 224 866", email: "prossy.nabwire@gmail.com", programme: "safety", cohort: "February 2026", status: "contacted" },
    { id: "e3", createdAt: "2026-02-06T09:12:00.000Z", name: "Ronald Kiiza", phone: "+256 772 800 341", email: "ronald.kiiza@gmail.com", programme: "technical", cohort: "March 2026", status: "new" },
  ],
  settings: {
    phone1: "+256 772 284451",
    phone2: "+256 791 696970",
    email: "kqualityw@gmail.com",
    address: "Diika Road, Bweyale Town Council, Kiryandongo District, Uganda",
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
    x: "https://x.com/",
  },
  messages: 3,
};

const DB_KEY = "kimuna.db.v1";

function read(): DB {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return structuredClone(seed);
    const parsed = JSON.parse(raw) as DB;
    return { ...structuredClone(seed), ...parsed };
  } catch {
    return structuredClone(seed);
  }
}

let state: DB = typeof window === "undefined" ? seed : read();
const listeners = new Set<() => void>();

function commit(next: DB) {
  state = next;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(next));
  } catch {
    /* quota — keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, () => state, () => seed);
}

export function resetDB() {
  commit(structuredClone(seed));
}

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- public reads ---------- */
export const publicProjects = () => state.projects.filter((p) => p.published);
export const publicProducts = () => state.products;
export const publicTestimonials = () => state.testimonials.filter((t) => t.approved && !t.hidden);

/* ---------- writes ---------- */
export function submitQuote(input: Omit<Quote, "id" | "createdAt" | "status" | "notes">) {
  const quote: Quote = { ...input, id: uid(), createdAt: new Date().toISOString(), status: "new", notes: "" };
  commit({ ...state, quotes: [quote, ...state.quotes] });
  return quote;
}

export function submitTraining(input: Omit<TrainingEnquiry, "id" | "createdAt" | "status">) {
  const row: TrainingEnquiry = { ...input, id: uid(), createdAt: new Date().toISOString(), status: "new" };
  commit({ ...state, training: [row, ...state.training] });
  return row;
}

export const admin = {
  upsertProject: (p: Project) => {
    const exists = state.projects.some((x) => x.id === p.id);
    commit({ ...state, projects: exists ? state.projects.map((x) => (x.id === p.id ? p : x)) : [p, ...state.projects] });
  },
  removeProject: (id: string) => commit({ ...state, projects: state.projects.filter((x) => x.id !== id) }),
  upsertProduct: (p: Product) => {
    const exists = state.products.some((x) => x.id === p.id);
    commit({ ...state, products: exists ? state.products.map((x) => (x.id === p.id ? p : x)) : [p, ...state.products] });
  },
  removeProduct: (id: string) => commit({ ...state, products: state.products.filter((x) => x.id !== id) }),
  upsertTestimonial: (t: Testimonial) => {
    const exists = state.testimonials.some((x) => x.id === t.id);
    commit({ ...state, testimonials: exists ? state.testimonials.map((x) => (x.id === t.id ? t : x)) : [t, ...state.testimonials] });
  },
  removeTestimonial: (id: string) => commit({ ...state, testimonials: state.testimonials.filter((x) => x.id !== id) }),
  patchQuote: (id: string, patch: Partial<Quote>) =>
    commit({ ...state, quotes: state.quotes.map((q) => (q.id === id ? { ...q, ...patch } : q)) }),
  removeQuote: (id: string) => commit({ ...state, quotes: state.quotes.filter((q) => q.id !== id) }),
  patchTraining: (id: string, patch: Partial<TrainingEnquiry>) =>
    commit({ ...state, training: state.training.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
  saveSettings: (s: Settings) => commit({ ...state, settings: s }),
};

/* ---------- helpers shared by public + admin ---------- */
export const waLink = (phone: string, text = "") =>
  `https://wa.me/${phone.replace(/[^0-9]/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const telLink = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, "")}`;

export const ugx = (n: number) => `${new Intl.NumberFormat("en-UG").format(n)} UGX`;

export function toCSV(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h] ?? "")).join(","))].join("\n");
}

export function download(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
