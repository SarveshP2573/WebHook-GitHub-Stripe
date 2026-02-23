// src/pages/PaymentAnalytics.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/stripe";

// ─── colour helpers ──────────────────────────────────────────────────────────
const STATUS_COLOR = {
  paid:      { bg: "#052e16", text: "#4ade80", border: "rgba(74,222,128,.25)" },
  open:      { bg: "#1e3a5f", text: "#60a5fa", border: "rgba(96,165,250,.25)" },
  void:      { bg: "#2d1b4e", text: "#c084fc", border: "rgba(192,132,252,.25)" },
  uncollectible: { bg: "#450a0a", text: "#f87171", border: "rgba(248,113,113,.25)" },
};
const statusStyle = (s) => STATUS_COLOR[s] || { bg: "#1e293b", text: "#94a3b8", border: "transparent" };

const currSym = { usd: "$", eur: "€", inr: "₹", gbp: "£" };
const fmt = (amt, cur = "usd") =>
  `${currSym[cur?.toLowerCase()] ?? "$"}${Number(amt).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── mini bar chart ──────────────────────────────────────────────────────────
const MiniBar = ({ data, color = "#6366f1" }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "56px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
          <div style={{
            width: "100%", borderRadius: "3px 3px 0 0",
            height: `${Math.max((d.value / max) * 48, 3)}px`,
            background: i === data.length - 1 ? color : `${color}55`,
            transition: "height 0.4s ease",
          }} />
          <span style={{ fontSize: "9px", color: "#475569", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, chart }) => (
  <div style={{
    background: "#111827", border: "1px solid #1e293b",
    borderTop: `3px solid ${accent}`, borderRadius: "14px", padding: "20px",
    display: "flex", flexDirection: "column", gap: "8px",
  }}>
    <p style={{ color: "#64748b", fontSize: "11px", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</p>
    <p style={{ fontSize: "26px", fontWeight: 800, margin: 0, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{value}</p>
    {sub && <p style={{ color: "#475569", fontSize: "12px", margin: 0 }}>{sub}</p>}
    {chart && <MiniBar data={chart} color={accent} />}
  </div>
);

// ─── skeleton loader ─────────────────────────────────────────────────────────
const Skeleton = ({ h = 20, w = "100%", r = 8 }) => (
  <div style={{
    height: h, width: w, borderRadius: r,
    background: "linear-gradient(90deg,#1e293b 25%,#2d3748 50%,#1e293b 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  }} />
);

export default function PaymentAnalytics({ onBack }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [tab, setTab]       = useState("overview"); // overview | invoices | customers

  // ── fetch everything from your backend ──────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Hit your existing /logs endpoint + two new analytics endpoints
      const [logsRes, analyticsRes, invoicesRes] = await Promise.all([
        axios.get(`${API}/logs`),
        axios.get(`${API}/analytics`).catch(() => ({ data: null })),   // graceful – may not exist yet
        axios.get(`${API}/invoices`).catch(() => ({ data: null })),
      ]);

      const logs     = logsRes.data ?? [];
      const invoices = invoicesRes.data?.data ?? invoicesRes.data ?? [];

      // ── derive stats from logs ────────────────────────────────────────
      const paidEvents = logs.filter(
        (l) => l.type === "invoice.paid" || l.type === "payment_intent.succeeded"
      );
      const failedEvents = logs.filter((l) => l.type?.includes("failed"));

      const totalRevenue = paidEvents.reduce((s, l) => {
        const raw = l.data?.amount_paid ?? l.data?.amount ?? 0;
        return s + raw;
      }, 0);

      const successRate =
        paidEvents.length + failedEvents.length > 0
          ? ((paidEvents.length / (paidEvents.length + failedEvents.length)) * 100).toFixed(1)
          : "—";

      // ── revenue by day (last 7 days) ──────────────────────────────────
      const dayMap = {};
      const days   = Array.from({ length: 7 }, (_, i) => {
        const d  = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        dayMap[d.toDateString()] = key;
        return { label: key, value: 0, dateStr: d.toDateString() };
      });

      paidEvents.forEach((l) => {
        const ds  = new Date(l.createdAt).toDateString();
        const day = days.find((d) => d.dateStr === ds);
        if (day) day.value += (l.data?.amount_paid ?? l.data?.amount ?? 0) / 100;
      });

      // ── top customers ─────────────────────────────────────────────────
      const custMap = {};
      paidEvents.forEach((l) => {
        const email = l.data?.customer_email ?? l.data?.receipt_email;
        if (!email) return;
        if (!custMap[email]) custMap[email] = { email, total: 0, count: 0 };
        custMap[email].total += (l.data?.amount_paid ?? l.data?.amount ?? 0) / 100;
        custMap[email].count += 1;
      });
      const topCustomers = Object.values(custMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

      // ── event type breakdown ──────────────────────────────────────────
      const typeMap = {};
      logs.forEach((l) => {
        typeMap[l.type] = (typeMap[l.type] ?? 0) + 1;
      });
      const eventBreakdown = Object.entries(typeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      // ── recent invoices (from logs if no dedicated endpoint) ──────────
      const recentInvoices =
        invoices.length > 0
          ? invoices.slice(0, 20)
          : logs
              .filter((l) => l.type?.startsWith("invoice."))
              .slice(0, 20)
              .map((l) => ({
                id:             l.data?.id,
                customer_email: l.data?.customer_email,
                amount_due:     l.data?.amount_due ?? l.data?.amount_paid ?? 0,
                amount_paid:    l.data?.amount_paid ?? 0,
                currency:       l.data?.currency ?? "usd",
                status:         l.data?.status ?? (l.type === "invoice.paid" ? "paid" : "open"),
                created:        new Date(l.createdAt).getTime() / 1000,
                invoice_pdf:    l.data?.invoice_pdf,
              }));

      setData({
        totalRevenue: totalRevenue / 100,
        successRate,
        totalEvents: logs.length,
        paidCount:   paidEvents.length,
        failedCount: failedEvents.length,
        revenueByDay: days,
        topCustomers,
        eventBreakdown,
        recentInvoices,
        rawLogs: logs,
        analytics: analyticsRes.data,
      });
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message ?? e.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#0a0f1e 0%,#0f172a 60%,#0d1b2e 100%)",
      padding: "40px 24px",
      fontFamily: "'Inter',-apple-system,sans-serif",
      color: "#f1f5f9",
    }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .ana-row:hover { background: rgba(255,255,255,.03) !important; }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── header ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
          <button onClick={onBack} style={{
            padding: "8px 14px", borderRadius: "8px",
            border: "1px solid #1e293b", background: "transparent",
            color: "#64748b", cursor: "pointer", fontSize: "13px",
          }}>← Back</button>

          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              Payment Analytics
            </h1>
            <p style={{ color: "#475569", fontSize: "13px", margin: "3px 0 0" }}>
              Live data from Stripe
            </p>
          </div>

          <button onClick={load} disabled={loading} style={{
            marginLeft: "auto", padding: "8px 16px", borderRadius: "8px",
            border: "1px solid #1e293b", background: "transparent",
            color: loading ? "#334155" : "#94a3b8", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px",
          }}>
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>

        {/* ── error ──────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            padding: "14px 18px", borderRadius: "12px", marginBottom: "24px",
            background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)",
            color: "#fca5a5", fontSize: "14px",
          }}>
            ⚠️ {error}
            <button onClick={load} style={{ marginLeft: "12px", color: "#f87171", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: "13px" }}>
              Retry
            </button>
          </div>
        )}

        {/* ── stat cards ─────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: "#111827", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <Skeleton h={12} w="60%" />
                <Skeleton h={30} w="80%" />
                <Skeleton h={10} w="50%" />
              </div>
            ))
          ) : data ? (
            <>
              <StatCard label="Total Revenue" value={fmt(data.totalRevenue)} sub={`from ${data.paidCount} payments`} accent="#6366f1" chart={data.revenueByDay} />
              <StatCard label="Success Rate"  value={`${data.successRate}%`} sub={`${data.failedCount} failed events`} accent="#22c55e" />
              <StatCard label="Total Events"  value={data.totalEvents}        sub="logged by webhook"                   accent="#f59e0b" />
              <StatCard label="Customers"     value={data.topCustomers.length} sub="with paid invoices"                 accent="#38bdf8" />
            </>
          ) : null}
        </div>

        {/* ── tabs ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
          {[
            { id: "overview",   label: "Overview" },
            { id: "invoices",   label: "Invoices" },
            { id: "customers",  label: "Top Customers" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "7px 16px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 500,
              background: tab === t.id ? "#6366f1" : "#1e293b",
              color:      tab === t.id ? "white"   : "#64748b",
              transition: "all .15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {tab === "overview" && (
          <div style={{ animation: "fadeIn .3s ease", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

            {/* Revenue chart */}
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: 24 }}>
              <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Revenue — Last 7 Days</h3>
              {loading ? <Skeleton h={80} /> : data ? (
                <RevenueBarChart data={data.revenueByDay} />
              ) : null}
            </div>

            {/* Event breakdown */}
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: 24 }}>
              <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Event Breakdown</h3>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={14} />)}
                </div>
              ) : data ? (
                <EventBreakdown items={data.eventBreakdown} total={data.totalEvents} />
              ) : null}
            </div>

            {/* Recent raw logs */}
            <div style={{ gridColumn: "1 / -1", background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Recent Events</h3>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={40} />)}
                </div>
              ) : data ? (
                <LogTable logs={data.rawLogs.slice(0, 10)} />
              ) : null}
            </div>
          </div>
        )}

        {/* ══════════════ INVOICES TAB ══════════════ */}
        {tab === "invoices" && (
          <div style={{ animation: "fadeIn .3s ease", background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: 24 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
              All Invoices {data && <span style={{ color: "#334155", fontWeight: 400 }}>({data.recentInvoices.length})</span>}
            </h3>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={44} />)}
              </div>
            ) : data ? (
              <InvoiceTable invoices={data.recentInvoices} />
            ) : null}
          </div>
        )}

        {/* ══════════════ CUSTOMERS TAB ══════════════ */}
        {tab === "customers" && (
          <div style={{ animation: "fadeIn .3s ease", background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: 24 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Top Customers by Revenue</h3>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={52} />)}
              </div>
            ) : data ? (
              <CustomerTable customers={data.topCustomers} />
            ) : null}
            {!loading && data?.topCustomers.length === 0 && (
              <p style={{ color: "#334155", textAlign: "center", padding: "40px 0" }}>
                No customer data yet — payments will appear here once invoices are paid.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Revenue bar chart (full height, labelled) ───────────────────────────────
function RevenueBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
        {data.map((d, i) => {
          const pct = Math.max((d.value / max) * 100, d.value > 0 ? 8 : 2);
          const isLast = i === data.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                {d.value > 0 && (
                  <span style={{ textAlign: "center", fontSize: "9px", color: isLast ? "#818cf8" : "#475569", marginBottom: "2px" }}>
                    ${d.value.toFixed(0)}
                  </span>
                )}
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  height: `${pct}%`,
                  background: isLast
                    ? "linear-gradient(to top, #6366f1, #818cf8)"
                    : "linear-gradient(to top, #1e3a5f, #2d4f7c)",
                  transition: "height .4s ease",
                }} />
              </div>
              <span style={{ fontSize: "10px", color: "#475569" }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Event breakdown list ────────────────────────────────────────────────────
function EventBreakdown({ items, total }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map(([type, count]) => {
        const pct = ((count / total) * 100).toFixed(0);
        const isPaid    = type.includes("paid") || type.includes("succeeded");
        const isFailed  = type.includes("failed");
        const barColor  = isPaid ? "#22c55e" : isFailed ? "#ef4444" : "#6366f1";
        return (
          <div key={type}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>{type.replace(/\./g, " › ")}</span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>{count} <span style={{ color: "#334155" }}>({pct}%)</span></span>
            </div>
            <div style={{ height: "4px", background: "#1e293b", borderRadius: "2px" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "2px", transition: "width .4s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recent log table ────────────────────────────────────────────────────────
function LogTable({ logs }) {
  if (!logs.length) return <p style={{ color: "#334155", textAlign: "center", padding: "24px 0" }}>No events yet.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            {["Event", "Email", "Amount", "Time"].map((h) => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1e293b" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => {
            const isPaid   = l.type?.includes("paid") || l.type?.includes("succeeded");
            const isFailed = l.type?.includes("failed");
            const dotColor = isPaid ? "#22c55e" : isFailed ? "#ef4444" : "#6366f1";
            const email    = l.data?.customer_email ?? l.data?.receipt_email ?? "—";
            const amt      = l.data?.amount_paid ?? l.data?.amount ?? null;
            return (
              <tr key={l._id} className="ana-row" style={{ borderBottom: "1px solid rgba(255,255,255,.03)", transition: "background .15s" }}>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                    <span style={{ color: "#cbd5e1" }}>{l.type?.replace(/\./g, " › ")}</span>
                  </span>
                </td>
                <td style={{ padding: "10px 12px", color: "#64748b" }}>{email}</td>
                <td style={{ padding: "10px 12px", color: amt ? "#4ade80" : "#334155", fontWeight: amt ? 600 : 400 }}>
                  {amt != null ? fmt(amt / 100, l.data?.currency) : "—"}
                </td>
                <td style={{ padding: "10px 12px", color: "#475569", fontSize: "12px" }}>
                  {new Date(l.createdAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Invoice table ───────────────────────────────────────────────────────────
function InvoiceTable({ invoices }) {
  if (!invoices.length) return <p style={{ color: "#334155", textAlign: "center", padding: "24px 0" }}>No invoices yet.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            {["Invoice ID", "Customer", "Amount", "Status", "Date", "PDF"].map((h) => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1e293b" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => {
            const sc = statusStyle(inv.status);
            return (
              <tr key={inv.id ?? i} className="ana-row" style={{ borderBottom: "1px solid rgba(255,255,255,.03)", transition: "background .15s" }}>
                <td style={{ padding: "10px 12px", color: "#64748b", fontFamily: "monospace", fontSize: "12px" }}>
                  {inv.id ? inv.id.slice(0, 18) + "…" : "—"}
                </td>
                <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{inv.customer_email ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#f1f5f9", fontWeight: 600 }}>
                  {fmt((inv.amount_paid || inv.amount_due || 0) / 100, inv.currency)}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    padding: "3px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                    background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                  }}>
                    {inv.status ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", color: "#475569", fontSize: "12px" }}>
                  {inv.created ? new Date(inv.created * 1000).toLocaleDateString() : "—"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {inv.invoice_pdf ? (
                    <button onClick={() => window.open(inv.invoice_pdf, "_blank")} style={{
                      padding: "4px 10px", borderRadius: "6px", border: "1px solid #1e3a5f",
                      background: "rgba(99,102,241,.1)", color: "#818cf8",
                      cursor: "pointer", fontSize: "12px", fontWeight: 600,
                    }}>↓ PDF</button>
                  ) : <span style={{ color: "#334155" }}>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Customer table ──────────────────────────────────────────────────────────
function CustomerTable({ customers }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {customers.map((c, i) => (
        <div key={c.email} style={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "14px 16px", borderRadius: "10px",
          background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.05)",
        }}>
          {/* rank */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: i === 0 ? "linear-gradient(135deg,#f59e0b,#d97706)" : i === 1 ? "linear-gradient(135deg,#94a3b8,#64748b)" : i === 2 ? "linear-gradient(135deg,#b45309,#92400e)" : "#1e293b",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "13px", color: i < 3 ? "white" : "#475569",
          }}>
            {i + 1}
          </div>

          {/* avatar initial */}
          <div style={{
            width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
            background: `hsl(${(c.email.charCodeAt(0) * 37) % 360},60%,25%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: 700, color: `hsl(${(c.email.charCodeAt(0) * 37) % 360},80%,70%)`,
          }}>
            {c.email[0].toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.email}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>
              {c.count} payment{c.count !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#4ade80" }}>
              {fmt(c.total)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#334155" }}>lifetime</p>
          </div>
        </div>
      ))}
    </div>
  );
}
