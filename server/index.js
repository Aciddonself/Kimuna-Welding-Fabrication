/**
 * KIMUNA API — Express + Supabase (PostgreSQL) + JWT + bcrypt
 * ---------------------------------------------------------------
 *  npm install && npm run dev        (inside /server)
 *
 *  Endpoints
 *    POST   /api/auth/login              public, 5 req / 15 min
 *    GET    /api/auth/me                 JWT
 *    GET    /api/stats                   JWT  · overview cards + chart
 *    *      /api/quotes                  GET public create / JWT for the rest
 *    *      /api/projects  /api/products /api/training /api/testimonials   JWT (GET is public)
 *    GET    /api/settings                public      PATCH /api/settings  JWT
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || "*").split(","), credentials: true }));
app.use(express.json({ limit: "2mb" }));

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/* ------------------------------ helpers ------------------------------ */
const ok = (res, data) => res.json({ ok: true, data });
const fail = (res, status, message) => res.status(status).json({ ok: false, message });

function sign(session) {
  return jwt.sign(session, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "30m" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, 401, "Missing token");
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return fail(res, 401, "Token expired or invalid");
  }
}

async function notifyAdmin(quote) {
  if (!process.env.SMTP_HOST) return;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    replyTo: quote.email,
    subject: `KIMUNA quote request — ${quote.service}`,
    html: `<h2>New quote request</h2>
      <p><b>Name:</b> ${quote.name}<br/>
      <b>Phone:</b> ${quote.phone}<br/>
      <b>Email:</b> ${quote.email}<br/>
      <b>Service:</b> ${quote.service}</p>
      <p>${String(quote.message).replace(/\n/g, "<br/>")}</p>`,
  });
}

/* ------------------------------ auth ------------------------------ */
app.post(
  "/api/auth/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, message: { ok: false, message: "Too many attempts, try later." } }),
  async (req, res) => {
    try {
      const email = String(req.body.email || "").toLowerCase().trim();
      const password = String(req.body.password || "");

      let hash = process.env.ADMIN_PASSWORD_HASH;
      const { data: user } = await db.from("admin_users").select("*").eq("email", email).single();
      if (user) hash = user.password_hash;
      if (!hash) return fail(res, 401, "Invalid credentials");

      const valid = await bcrypt.compare(password, hash);
      if (!valid) return fail(res, 401, "Invalid credentials");

      if (user) await db.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);

      const session = { sub: user?.id || "env-admin", email, role: user?.role || "superadmin" };
      ok(res, { token: sign(session), expiresIn: process.env.JWT_EXPIRES_IN || "30m", admin: session });
    } catch (err) {
      console.error(err);
      fail(res, 500, "Login failed");
    }
  }
);

app.get("/api/auth/me", requireAuth, (req, res) => ok(res, req.admin));

/* ------------------------------ stats ------------------------------ */
app.get("/api/stats", requireAuth, async (_req, res) => {
  try {
    const [quotes, projects, products, training] = await Promise.all([
      db.from("quotes").select("id,status,created_at"),
      db.from("projects").select("id,published"),
      db.from("products").select("id,stock"),
      db.from("training_enquiries").select("id,status"),
    ]);
    const rows = quotes.data || [];
    const months = [...Array(6)].map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        label: d.toLocaleString("en", { month: "short" }),
        count: rows.filter((q) => {
          const c = new Date(q.created_at);
          return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
        }).length,
      };
    });
    ok(res, {
      newQuotes: rows.filter((q) => q.status === "new").length,
      unreadMessages: rows.filter((q) => q.status === "new").length,
      totalProjects: projects.data?.length || 0,
      publishedProjects: projects.data?.filter((p) => p.published).length || 0,
      products: products.data?.length || 0,
      inStock: products.data?.filter((p) => p.stock).length || 0,
      training: training.data?.length || 0,
      months,
    });
  } catch (err) {
    console.error(err);
    fail(res, 500, "Could not load stats");
  }
});

/* ------------------------------ quotes ------------------------------ */
app.get("/api/quotes", requireAuth, async (_req, res) => {
  const { data, error } = await db.from("quotes").select("*").order("created_at", { ascending: false });
  error ? fail(res, 500, error.message) : ok(res, data);
});

app.post("/api/quotes", rateLimit({ windowMs: 10 * 60 * 1000, limit: 10 }), async (req, res) => {
  try {
    const { name, phone, email, service, message } = req.body || {};
    if (!name || !phone || !email || !service || !message) return fail(res, 400, "Missing fields");
    const { data, error } = await db
      .from("quotes")
      .insert({ name, phone, email, service, message })
      .select()
      .single();
    if (error) return fail(res, 500, error.message);
    notifyAdmin(data).catch(console.error);
    ok(res, data);
  } catch (err) {
    console.error(err);
    fail(res, 500, "Could not save request");
  }
});

app.patch("/api/quotes/:id", requireAuth, async (req, res) => {
  const { data, error } = await db.from("quotes").update(req.body).eq("id", req.params.id).select().single();
  error ? fail(res, 500, error.message) : ok(res, data);
});

app.delete("/api/quotes/:id", requireAuth, async (req, res) => {
  const { error } = await db.from("quotes").delete().eq("id", req.params.id);
  error ? fail(res, 500, error.message) : ok(res, { id: req.params.id });
});

/* -------------------------- generic CRUD -------------------------- */
const crud = (table) => {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    const { data, error } = await db.from(table).select("*").order("created_at", { ascending: false });
    error ? fail(res, 500, error.message) : ok(res, data);
  });

  router.get("/:id", async (req, res) => {
    const { data, error } = await db.from(table).select("*").eq("id", req.params.id).single();
    error ? fail(res, 404, error.message) : ok(res, data);
  });

  router.post("/", requireAuth, async (req, res) => {
    const { data, error } = await db.from(table).insert(req.body).select().single();
    error ? fail(res, 500, error.message) : ok(res, data);
  });

  router.put("/:id", requireAuth, async (req, res) => {
    const { data, error } = await db.from(table).update(req.body).eq("id", req.params.id).select().single();
    error ? fail(res, 500, error.message) : ok(res, data);
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    const { error } = await db.from(table).delete().eq("id", req.params.id);
    error ? fail(res, 500, error.message) : ok(res, { id: req.params.id });
  });

  return router;
};

app.use("/api/projects", crud("projects"));
app.use("/api/products", crud("products"));
app.use("/api/training", crud("training_enquiries"));
app.use("/api/testimonials", crud("testimonials"));

/* ------------------------------ settings ------------------------------ */
app.get("/api/settings", async (_req, res) => {
  const { data, error } = await db.from("site_settings").select("*").eq("id", 1).single();
  error ? fail(res, 500, error.message) : ok(res, data);
});

app.patch("/api/settings", requireAuth, async (req, res) => {
  const { data, error } = await db
    .from("site_settings")
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  error ? fail(res, 500, error.message) : ok(res, data);
});

/* ------------------------------ boot ------------------------------ */
app.get("/health", (_req, res) => res.json({ ok: true, service: "kimuna-api", ts: Date.now() }));
app.use((_req, res) => fail(res, 404, "Not found"));

app.listen(PORT, () => console.log(`KIMUNA API listening on :${PORT}`));
