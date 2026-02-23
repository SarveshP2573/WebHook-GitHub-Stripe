import { useEffect, useState } from "react";
import axios from "axios";

const PaymentTracking = ({ onBack }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stripe/logs");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only sum invoice.paid events to avoid double-counting
  const totalRevenue = payments
    .filter(item => item.type === "invoice.paid" || item.type === "payment_intent.succeeded")
    .reduce((sum, item) => sum + (item.data?.amount_paid || item.data?.amount || 0), 0);

  const successCount = payments.filter(i =>
    i.type?.includes("succeeded") || i.type?.includes("paid")
  ).length;

  const failedCount = payments.filter(i => i.type?.includes("failed")).length;

  const filtered = filter === "all"
    ? payments
    : payments.filter(i => i.type?.includes(filter));

  const getBadgeStyle = (type) => {
    if (type?.includes("succeeded") || type?.includes("paid"))
      return { bg: "#052e16", color: "#4ade80", label: "Success" };
    if (type?.includes("created") || type?.includes("updated") || type?.includes("finalized"))
      return { bg: "#1e3a5f", color: "#60a5fa", label: "Info" };
    if (type?.includes("failed"))
      return { bg: "#450a0a", color: "#f87171", label: "Failed" };
    return { bg: "#1e293b", color: "#94a3b8", label: "Other" };
  };

  // ✅ Get amount from wherever it lives on the event object
  const getAmount = (item) => {
    const raw = item.data?.amount_paid || item.data?.amount_due || item.data?.amount || 0;
    return raw > 0 ? (raw / 100).toFixed(2) : null;
  };

  // ✅ Get email from wherever it lives
  const getEmail = (item) => {
    return item.data?.customer_email || item.data?.receipt_email || null;
  };

  const formatEventType = (type) => type?.replace(/\./g, " › ") || "unknown";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0f1e 0%, #0f172a 50%, #0d1f35 100%)",
      padding: "40px 20px",
      fontFamily: "'Inter', sans-serif",
      color: "white",
    }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
          <button onClick={onBack} style={{
            padding: "8px 14px", borderRadius: "8px", border: "1px solid #334155",
            background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "14px"
          }}>
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
              Payment Dashboard
            </h1>
            <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
              Live Stripe event log
            </p>
          </div>
          <button onClick={fetchPayments} style={{
            marginLeft: "auto", padding: "8px 16px", borderRadius: "8px",
            border: "1px solid #334155", background: "transparent",
            color: "#94a3b8", cursor: "pointer", fontSize: "13px"
          }}>
            ↻ Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            {
              label: "Total Revenue",
              value: `$${(totalRevenue / 100).toFixed(2)}`,
              sub: "from paid invoices",
              accent: "#6366f1"
            },
            {
              label: "Successful Events",
              value: successCount,
              sub: "payments & invoices",
              accent: "#22c55e"
            },
            {
              label: "Failed Events",
              value: failedCount,
              sub: "requires attention",
              accent: "#ef4444"
            },
          ].map((card) => (
            <div key={card.label} style={{
              background: "#111827",
              border: `1px solid #1e293b`,
              borderTop: `3px solid ${card.accent}`,
              padding: "20px",
              borderRadius: "12px",
            }}>
              <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {card.label}
              </p>
              <p style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 4px" }}>
                {card.value}
              </p>
              <p style={{ color: "#475569", fontSize: "12px", margin: 0 }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["all", "paid", "failed", "created"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "500",
              background: filter === f ? "#6366f1" : "#1e293b",
              color: filter === f ? "white" : "#94a3b8",
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span style={{ marginLeft: "auto", color: "#475569", fontSize: "13px", alignSelf: "center" }}>
            {filtered.length} events
          </span>
        </div>

        {/* Event List */}
        {loading && (
          <div style={{ textAlign: "center", color: "#475569", padding: "60px 0" }}>
            Loading events...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: "center", color: "#475569", padding: "60px 0",
            background: "#111827", borderRadius: "12px", border: "1px solid #1e293b"
          }}>
            No events found
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((item) => {
            const badge = getBadgeStyle(item.type);
            const amount = getAmount(item);
            const email = getEmail(item);

            return (
              <div key={item._id} style={{
                background: "#111827",
                border: "1px solid #1e293b",
                padding: "16px 20px",
                borderRadius: "12px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "12px",
                alignItems: "center",
              }}>
                <div>
                  {/* Event type + badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{
                      background: badge.bg, color: badge.color,
                      padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600"
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                      {formatEventType(item.type)}
                    </span>
                  </div>

                  {/* Details row */}
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    {email && (
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        📧 {email}
                      </span>
                    )}
                    {amount && (
                      <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: "600" }}>
                        💰 ${amount}
                      </span>
                    )}
                    {item.data?.currency && (
                      <span style={{ color: "#475569", fontSize: "12px" }}>
                        {item.data.currency.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "#475569", fontSize: "11px", margin: 0 }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ color: "#334155", fontSize: "11px", margin: "2px 0 0" }}>
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PaymentTracking;