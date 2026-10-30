import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Download,
  Eye,
  EyeOff,
  Filter,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { admin, download, telLink, toCSV, ugx, useDB, waLink, type Product, type Project, type Quote, type QuoteStatus } from "../lib/db";
import { CloseBtn, ConfirmDialog, EmptyState, Field, Panel, Pill, TableSkeleton, inputCls, useFakeLoad, useToast } from "./ui";

const SERVICE_IDS = ["steel", "welding", "training", "gas", "safety", "civil", "drilling", "furniture"];
const SERVICE_LABEL: Record<string, string> = {
  steel: "Steel Structure Construction",
  welding: "General Welding & Fabrication",
  training: "Technical Training",
  gas: "Gas Supply",
  safety: "Health & Safety Training",
  civil: "Civil Engineering Work",
  drilling: "Drilling Engineering",
  furniture: "Furniture Dealings",
};
const CATEGORY_LABEL: Record<Project["category"], string> = {
  steel: "Steel Structures",
  fabrication: "Fabrication",
  furniture: "Furniture",
  civil: "Civil Works",
};

function Head({ label, title, note, action }: { label: string; title: string; note: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="spec-label text-blue dark:text-sky">{label}</span>
        <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl dark:text-white">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-soft">{note}</p>
      </div>
      {action}
    </div>
  );
}

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-blue px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 dark:bg-sky dark:text-[#06172e]";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-bold text-soft transition-all hover:border-sky hover:text-blue";

function ImageField({ value, onChange, label = "Image" }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <Field label={label} hint="Upload a file or paste an image URL. Local uploads are stored in the browser; production uploads go to Supabase Storage.">
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-surface-2">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-soft">No image</span>
          )}
        </div>
        <label className="cursor-pointer rounded-full border border-line px-4 py-2.5 text-xs font-bold text-soft transition-colors hover:border-sky hover:text-blue">
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => onChange(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <input
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/image.jpg"
          className={`${inputCls} flex-1 !py-2.5 text-xs`}
        />
      </div>
    </Field>
  );
}

/* ================================================================ */
/*  QUOTES                                                           */
/* ================================================================ */
function Quotes() {
  const db = useDB();
  const toast = useToast();
  const loading = useFakeLoad(500);
  const [q, setQ] = useState("");
  const [service, setService] = useState("all");
  const [status, setStatus] = useState<"all" | QuoteStatus>("all");
  const [open, setOpen] = useState<Quote | null>(null);
  const [notes, setNotes] = useState("");
  const [del, setDel] = useState<Quote | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.quotes.filter((x) => {
      const okTerm =
        !term ||
        x.name.toLowerCase().includes(term) ||
        x.email.toLowerCase().includes(term) ||
        x.phone.includes(term) ||
        x.message.toLowerCase().includes(term);
      const okService = service === "all" || x.service === service;
      const okStatus = status === "all" || x.status === status;
      return okTerm && okService && okStatus;
    });
  }, [db.quotes, q, service, status]);

  const openRow = (x: Quote) => {
    setOpen(x);
    setNotes(x.notes);
  };

  const exportCsv = () => {
    download(
      `kimuna-quotes-${new Date().toISOString().slice(0, 10)}.csv`,
      toCSV(
        rows.map((x) => ({
          date: new Date(x.createdAt).toISOString().slice(0, 10),
          name: x.name,
          phone: x.phone,
          email: x.email,
          service: SERVICE_LABEL[x.service] ?? x.service,
          status: x.status,
          message: x.message,
          notes: x.notes,
        }))
      )
    );
    toast(`Exported ${rows.length} row(s) to CSV.`);
  };

  const statusTone = (s: QuoteStatus) => (s === "new" ? "spark" : s === "closed" ? "muted" : "blue") as "spark" | "muted" | "blue";

  return (
    <Panel>
      <Head
        label="Enquiry manager"
        title="Quote requests"
        note="Every submission from the public contact form lands here. Search, filter, note it, then reply in one click."
        action={
          <button onClick={exportCsv} className={btnGhost}>
            <Download size={14} /> Export CSV
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3 rounded-3xl border border-line bg-surface p-4 shadow-soft">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-4 -translate-y-1/2 text-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, email or message…"
            aria-label="Search quote requests"
            className={`${inputCls} !py-2.5 !pl-10`}
          />
        </div>
        <div className="relative">
          <Filter size={14} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-soft" />
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            aria-label="Filter by service"
            className={`${inputCls} !w-auto appearance-none !py-2.5 !pl-10 pr-9`}
          >
            <option value="all">All services</option>
            {SERVICE_IDS.map((s) => (
              <option key={s} value={s}>
                {SERVICE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          aria-label="Filter by status"
          className={`${inputCls} !w-auto appearance-none !py-2.5 pr-9`}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="No matching requests" body="Adjust the search term or filters to see more results." />
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden overflow-hidden rounded-3xl border border-line bg-surface shadow-soft lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface-2">
                <tr className="spec-label text-soft">
                  <th className="px-5 py-3.5 font-semibold">Client</th>
                  <th className="px-5 py-3.5 font-semibold">Service</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((x) => (
                  <tr key={x.id} className="transition-colors hover:bg-surface-2">
                    <td className="px-5 py-4">
                      <button onClick={() => openRow(x)} className="text-left">
                        <span className="block font-semibold text-ink dark:text-white">{x.name}</span>
                        <span className="block text-xs text-soft">{x.phone} · {x.email}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-soft">{SERVICE_LABEL[x.service] ?? x.service}</td>
                    <td className="px-5 py-4 text-soft tabular">{new Date(x.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-4">
                      <Pill tone={statusTone(x.status)}>{x.status}</Pill>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <a href={waLink(x.phone.replace(/\s/g, ""), `Hello ${x.name}, this is KIMUNA regarding your ${SERVICE_LABEL[x.service] ?? "quote"} request.`)} target="_blank" rel="noopener noreferrer" aria-label="Reply on WhatsApp" className="grid h-9 w-9 place-items-center rounded-full border border-line text-blue transition-colors hover:border-blue dark:text-sky">
                          <MessageCircle size={15} />
                        </a>
                        <a href={`mailto:${x.email}?subject=${encodeURIComponent(`KIMUNA quote — ${SERVICE_LABEL[x.service] ?? x.service}`)}`} aria-label="Reply by email" className="grid h-9 w-9 place-items-center rounded-full border border-line text-soft transition-colors hover:border-sky hover:text-blue">
                          <Mail size={15} />
                        </a>
                        <button onClick={() => openRow(x)} aria-label="View details" className="grid h-9 w-9 place-items-center rounded-full border border-line text-soft transition-colors hover:border-sky hover:text-blue">
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {rows.map((x) => (
              <li key={x.id} className="rounded-3xl border border-line bg-surface p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => openRow(x)} className="text-left">
                    <span className="block font-semibold text-ink dark:text-white">{x.name}</span>
                    <span className="block text-xs text-soft">{x.phone}</span>
                  </button>
                  <Pill tone={statusTone(x.status)}>{x.status}</Pill>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-soft">{x.message}</p>
                <div className="mt-4 flex gap-2">
                  <a href={waLink(x.phone.replace(/\s/g, ""), `Hello ${x.name}, this is KIMUNA.`)} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                  <button onClick={() => openRow(x)} className={btnGhost}>Details</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* detail drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex justify-end bg-[#071a33]/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Quote from ${open.name}`}
          >
            <motion.aside
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-surface p-5 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="spec-label text-blue dark:text-sky">Request detail</span>
                  <h2 className="font-display mt-1 text-xl font-bold text-ink dark:text-white">{open.name}</h2>
                </div>
                <CloseBtn onClick={() => setOpen(null)} label="Close detail" />
              </div>

              <dl className="mt-6 grid gap-3 text-sm">
                <div className="rounded-2xl border border-line bg-surface-2 p-4">
                  <dt className="spec-label text-soft">Contact</dt>
                  <dd className="mt-2 flex flex-col gap-2">
                    <a href={telLink(open.phone)} className="font-semibold text-ink hover:text-blue dark:text-white">{open.phone}</a>
                    <a href={`mailto:${open.email}`} className="break-all text-blue hover:underline dark:text-sky">{open.email}</a>
                  </dd>
                </div>
                <div className="rounded-2xl border border-line bg-surface-2 p-4">
                  <dt className="spec-label text-soft">Service · received</dt>
                  <dd className="mt-2 text-ink dark:text-white">
                    {SERVICE_LABEL[open.service] ?? open.service}
                    <span className="block text-xs text-soft">{new Date(open.createdAt).toLocaleString("en-GB")}</span>
                  </dd>
                </div>
                <div className="rounded-2xl border border-line bg-surface-2 p-4">
                  <dt className="spec-label text-soft">Message</dt>
                  <dd className="mt-2 leading-relaxed text-ink dark:text-white/90">{open.message}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-4">
                <Field label="Status">
                  <select
                    value={open.status}
                    onChange={(e) => {
                      const s = e.target.value as QuoteStatus;
                      admin.patchQuote(open.id, { status: s });
                      setOpen({ ...open, status: s });
                      toast(`Marked as ${s}.`);
                    }}
                    className={inputCls}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="closed">Closed</option>
                  </select>
                </Field>
                <Field label="Internal notes">
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Call outcome, pricing, follow-up date…"
                    className={`${inputCls} resize-y`}
                  />
                </Field>
                <button
                  onClick={() => {
                    admin.patchQuote(open.id, { notes });
                    toast("Note saved.");
                  }}
                  className={btnPrimary}
                >
                  <Check size={15} /> Save note
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                <a
                  href={waLink(open.phone.replace(/\s/g, ""), `Hello ${open.name}, this is KIMUNA responding to your request for ${SERVICE_LABEL[open.service] ?? "our services"}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-spark px-5 py-3 text-sm font-bold text-[#0B2545] transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={15} /> Reply on WhatsApp
                </a>
                <a href={`mailto:${open.email}?subject=${encodeURIComponent("Your KIMUNA quote")}`} className={btnGhost}>
                  <Mail size={14} /> Reply by email
                </a>
                <button onClick={() => setDel(open)} className={`${btnGhost} !border-spark/40 !text-spark-600`}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!del}
        title="Delete this quote request?"
        body="The request and its notes will be permanently removed. This cannot be undone."
        onCancel={() => setDel(null)}
        onConfirm={() => {
          if (del) admin.removeQuote(del.id);
          setDel(null);
          setOpen(null);
          toast("Quote request deleted.", "info");
        }}
      />
    </Panel>
  );
}

/* ================================================================ */
/*  PROJECTS                                                         */
/* ================================================================ */
const blankProject = (): Project => ({
  id: Math.random().toString(36).slice(2, 9),
  title: "",
  description: "",
  category: "steel",
  image: "",
  location: "",
  year: String(new Date().getFullYear()),
  published: true,
});

function Projects() {
  const db = useDB();
  const toast = useToast();
  const loading = useFakeLoad(450);
  const [edit, setEdit] = useState<Project | null>(null);
  const [del, setDel] = useState<Project | null>(null);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    if (edit.title.trim().length < 3 || !edit.image) {
      toast("A title and an image are required.", "error");
      return;
    }
    admin.upsertProject(edit);
    toast("Project saved.");
    setEdit(null);
  };

  return (
    <Panel>
      <Head
        label="Gallery manager"
        title="Projects"
        note="Published projects appear instantly in the public filterable gallery."
        action={
          <button onClick={() => setEdit(blankProject())} className={btnPrimary}>
            <Plus size={16} /> New project
          </button>
        }
      />

      {loading ? (
        <TableSkeleton rows={4} />
      ) : db.projects.length === 0 ? (
        <EmptyState title="No projects yet" body="Add your first project to populate the public gallery." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {db.projects.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
              <div className="relative">
                <img src={p.image} alt={p.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <span className="absolute top-3 left-3">
                  <Pill tone="blue">{CATEGORY_LABEL[p.category]}</Pill>
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold text-ink dark:text-white">{p.title}</h3>
                    <p className="mt-1 truncate text-xs text-soft">
                      {p.location} · {p.year}
                    </p>
                  </div>
                  <Pill tone={p.published ? "green" : "muted"}>{p.published ? "published" : "draft"}</Pill>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <button
                    onClick={() => setEdit(p)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-bold text-soft transition-colors hover:border-sky hover:text-blue"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      admin.upsertProject({ ...p, published: !p.published });
                      toast(p.published ? "Moved to draft." : "Published to gallery.");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-bold text-soft transition-colors hover:border-blue hover:text-blue"
                  >
                    {p.published ? <EyeOff size={12} /> : <Eye size={12} />}
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => setDel(p)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-spark/40 px-3.5 py-2 text-xs font-bold text-spark-600 transition-colors hover:bg-spark/10 dark:text-spark"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {edit && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#071a33]/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEdit(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Project editor"
          >
            <motion.form
              onSubmit={save}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-xl rounded-[26px] border border-line bg-surface p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="spec-label text-blue dark:text-sky">Project</span>
                  <h2 className="font-display text-xl font-bold text-ink dark:text-white">
                    {db.projects.some((x) => x.id === edit.id) ? "Edit project" : "New project"}
                  </h2>
                </div>
                <CloseBtn onClick={() => setEdit(null)} label="Close editor" />
              </div>

              <div className="mt-5 space-y-4">
                <Field label="Title">
                  <input className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Bweyale Grain Warehouse Frame" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Category">
                    <select
                      className={inputCls}
                      value={edit.category}
                      onChange={(e) => setEdit({ ...edit, category: e.target.value as Project["category"] })}
                    >
                      {(Object.keys(CATEGORY_LABEL) as Project["category"][]).map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABEL[c]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Location">
                    <input className={inputCls} value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} placeholder="Bweyale" />
                  </Field>
                  <Field label="Year">
                    <input className={inputCls} value={edit.year} onChange={(e) => setEdit({ ...edit, year: e.target.value })} />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea rows={3} className={`${inputCls} resize-y`} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
                </Field>
                <ImageField value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={edit.published}
                    onChange={(e) => setEdit({ ...edit, published: e.target.checked })}
                    className="h-4 w-4 accent-[#1E5AA8]"
                  />
                  <span className="text-sm font-semibold text-ink dark:text-white">Published to public gallery</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEdit(null)} className={btnGhost}>
                  Cancel
                </button>
                <button type="submit" className={btnPrimary}>
                  Save project
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!del}
        title="Delete this project?"
        body="It will be removed from the public gallery immediately."
        onCancel={() => setDel(null)}
        onConfirm={() => {
          if (del) admin.removeProject(del.id);
          setDel(null);
          toast("Project deleted.", "info");
        }}
      />
    </Panel>
  );
}

/* ================================================================ */
/*  PRODUCTS                                                         */
/* ================================================================ */
const blankProduct = (): Product => ({
  id: Math.random().toString(36).slice(2, 9),
  name: "",
  price: 0,
  image: "",
  category: "office",
  stock: true,
  description: "",
});

function Products() {
  const db = useDB();
  const toast = useToast();
  const loading = useFakeLoad(450);
  const [edit, setEdit] = useState<Product | null>(null);
  const [del, setDel] = useState<Product | null>(null);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    if (edit.name.trim().length < 3 || edit.price <= 0) {
      toast("Enter a product name and a price in UGX.", "error");
      return;
    }
    admin.upsertProduct(edit);
    toast("Product saved.");
    setEdit(null);
  };

  return (
    <Panel>
      <Head
        label="Catalogue manager"
        title="Furniture / products"
        note="Everything listed here shows on the public furniture catalogue with an Order via WhatsApp button."
        action={
          <button onClick={() => setEdit(blankProduct())} className={btnPrimary}>
            <Plus size={16} /> New product
          </button>
        }
      />

      {loading ? (
        <TableSkeleton rows={3} />
      ) : db.products.length === 0 ? (
        <EmptyState title="Catalogue is empty" body="Add a product to publish it to the furniture catalogue." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-2">
              <tr className="spec-label text-soft">
                <th className="px-5 py-3.5 font-semibold">Product</th>
                <th className="hidden px-5 py-3.5 font-semibold sm:table-cell">Category</th>
                <th className="px-5 py-3.5 font-semibold">Price</th>
                <th className="px-5 py-3.5 font-semibold">Stock</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {db.products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-11 w-11 rounded-xl border border-line object-cover" loading="lazy" />
                      <div className="min-w-0">
                        <span className="block truncate font-semibold text-ink dark:text-white">{p.name}</span>
                        <span className="block truncate text-xs text-soft">{p.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-soft sm:table-cell">{p.category}</td>
                  <td className="px-5 py-3.5 font-semibold text-blue tabular dark:text-sky">{ugx(p.price)}</td>
                  <td className="px-5 py-3.5">
                    <Pill tone={p.stock ? "green" : "spark"}>{p.stock ? "in stock" : "made to order"}</Pill>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEdit(p)} aria-label={`Edit ${p.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-line text-soft transition-colors hover:border-sky hover:text-blue">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDel(p)} aria-label={`Delete ${p.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-spark/40 text-spark-600 transition-colors hover:bg-spark/10 dark:text-spark">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {edit && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#071a33]/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEdit(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Product editor"
          >
            <motion.form
              onSubmit={save}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-xl rounded-[26px] border border-line bg-surface p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="spec-label text-blue dark:text-sky">Product</span>
                  <h2 className="font-display text-xl font-bold text-ink dark:text-white">
                    {db.products.some((x) => x.id === edit.id) ? "Edit product" : "New product"}
                  </h2>
                </div>
                <CloseBtn onClick={() => setEdit(null)} label="Close editor" />
              </div>

              <div className="mt-5 space-y-4">
                <Field label="Name">
                  <input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Steel-frame Office Desk" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Price (UGX)">
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={edit.price}
                      onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Category">
                    <select className={inputCls} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value as Product["category"] })}>
                      <option value="office">Office</option>
                      <option value="home">Home</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="school">School</option>
                    </select>
                  </Field>
                </div>
                <Field label="Description">
                  <textarea rows={3} className={`${inputCls} resize-y`} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
                </Field>
                <ImageField value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
                  <input type="checkbox" checked={edit.stock} onChange={(e) => setEdit({ ...edit, stock: e.target.checked })} className="h-4 w-4 accent-[#1E5AA8]" />
                  <span className="text-sm font-semibold text-ink dark:text-white">In stock (otherwise “made to order”)</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEdit(null)} className={btnGhost}>
                  Cancel
                </button>
                <button type="submit" className={btnPrimary}>
                  Save product
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!del}
        title="Delete this product?"
        body="It will be removed from the public furniture catalogue."
        onCancel={() => setDel(null)}
        onConfirm={() => {
          if (del) admin.removeProduct(del.id);
          setDel(null);
          toast("Product deleted.", "info");
        }}
      />
    </Panel>
  );
}

/* ================================================================ */
/*  TRAINING ENQUIRIES                                               */
/* ================================================================ */
export function TrainingPanel() {
  const db = useDB();
  const toast = useToast();
  const loading = useFakeLoad(450);

  return (
    <Panel>
      <Head
        label="Enrolments"
        title="Training enquiries"
        note="Technical Training and Health & Safety Training sign-ups from the public training section."
      />

      {loading ? (
        <TableSkeleton rows={3} />
      ) : db.training.length === 0 ? (
        <EmptyState title="No sign-ups yet" body="Training enquiries from the website will appear here." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {db.training.map((e) => (
            <li key={e.id} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink dark:text-white">{e.name}</h3>
                  <p className="text-xs text-soft">
                    {e.programme === "technical" ? "Technical Training" : "Health & Safety Training"} · {e.cohort}
                  </p>
                </div>
                <Pill tone={e.status === "enrolled" ? "green" : e.status === "new" ? "spark" : "blue"}>{e.status}</Pill>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <a href={telLink(e.phone)} className="text-ink hover:text-blue dark:text-white/90">{e.phone}</a>
                <a href={`mailto:${e.email}`} className="break-all text-blue dark:text-sky">{e.email}</a>
                <span className="text-xs text-soft">Received {new Date(e.createdAt).toLocaleDateString("en-GB")}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <select
                  value={e.status}
                  onChange={(e2) => {
                    admin.patchTraining(e.id, { status: e2.target.value as typeof e.status });
                    toast("Enquiry status updated.");
                  }}
                  aria-label="Enquiry status"
                  className={`${inputCls} !w-auto !py-2 text-xs`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="enrolled">Enrolled</option>
                </select>
                <a
                  href={waLink(e.phone.replace(/\s/g, ""), `Hello ${e.name}, this is KIMUNA about your training enquiry.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnGhost}
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
                <a href={`mailto:${e.email}`} className={btnGhost}>
                  <Mail size={13} /> Email
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default { Quotes, Projects, Products };
