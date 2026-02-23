import { useState } from "react";
import axios from "axios";

const InvoiceGenerator = () => {
  const [form, setForm] = useState({
    name: "", email: "", amount: "", description: "", currency: "usd",
  });
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.amount) e.amount = "Required";
    else if (Number(form.amount) <= 0) e.amount = "Must be > 0";
    return e;
  };

  const createInvoice = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    try {
      setLoading(true);
      setInvoiceData(null);
      const res = await axios.post("http://localhost:5000/api/stripe/create-invoice", form);
      setInvoiceData(res.data);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Failed to generate invoice." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInvoiceData(null);
    setForm({ name: "", email: "", amount: "", description: "", currency: "usd" });
    setErrors({});
  };

  const copyId = () => {
    navigator.clipboard.writeText(invoiceData.invoiceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sym = { usd: "$", eur: "€", inr: "₹" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0f1e 0%, #0f172a 60%, #0d1b2e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "500px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "16px", fontSize: "24px", marginBottom: "14px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
          }}>🧾</div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Invoice Generator
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            Create professional invoices in seconds
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(30,41,59,0.85)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px",
          overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}>

          {!invoiceData ? (
            <div style={{ padding: "28px" }}>

              {/* Name + Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <Field label="Name" name="name" placeholder="John Smith" icon="👤"
                  value={form.name} onChange={handleChange} error={errors.name} />
                <Field label="Email" name="email" placeholder="john@acme.com" icon="✉️"
                  value={form.email} onChange={handleChange} error={errors.email} />
              </div>

              {/* Amount + Currency */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Amount & Currency</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#818cf8", fontWeight: "700", fontSize: "15px" }}>
                      {sym[form.currency]}
                    </span>
                    <input name="amount" type="number" placeholder="0.00" value={form.amount} onChange={handleChange}
                      style={{ ...inp, paddingLeft: "30px", border: errors.amount ? "1px solid #ef4444" : inp.border }} />
                  </div>
                  <select name="currency" value={form.currency} onChange={handleChange}
                    style={{ ...inp, width: "95px", cursor: "pointer" }}>
                    <option value="usd">🇺🇸 USD</option>
                    <option value="eur">🇪🇺 EUR</option>
                    <option value="inr">🇮🇳 INR</option>
                  </select>
                </div>
                {errors.amount && <p style={errStyle}>{errors.amount}</p>}
              </div>

              {/* Description */}
              <Field label="Description" name="description" placeholder="Service fee, consulting..." icon="📝"
                value={form.description} onChange={handleChange} error={errors.description} />

              {errors.submit && (
                <div style={{
                  margin: "12px 0", padding: "12px 14px",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px", color: "#fca5a5", fontSize: "13px",
                }}>⚠️ {errors.submit}</div>
              )}

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

              <button onClick={createInvoice} disabled={loading} style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: "12px", color: "white",
                fontWeight: "700", fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s",
              }}>
                {loading ? <><Spinner /> Generating...</> : "Generate Invoice →"}
              </button>

            </div>
          ) : (
            /* SUCCESS */
            <div>
              <div style={{
                background: "linear-gradient(135deg, #052e16, #064e3b)",
                padding: "24px 28px", borderBottom: "1px solid rgba(34,197,94,0.15)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "42px", height: "42px", flexShrink: 0,
                    background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                  }}>✅</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#4ade80" }}>
                      Invoice Created!
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6ee7b7" }}>
                      Sent to {form.email}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "28px" }}>

                {/* Big amount */}
                <div style={{
                  textAlign: "center", padding: "22px",
                  background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)",
                  borderRadius: "14px", marginBottom: "16px",
                }}>
                  <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
                    Amount Due
                  </p>
                  <p style={{ fontSize: "42px", fontWeight: "800", margin: 0, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                    {sym[invoiceData.currency?.toLowerCase()] || "$"}{invoiceData.total?.toFixed(2)}
                  </p>
                  <p style={{ color: "#475569", fontSize: "12px", margin: "4px 0 0" }}>{invoiceData.currency}</p>
                </div>

                {/* Invoice ID row */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 14px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px", marginBottom: "16px",
                }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "10px", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Invoice ID</p>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: 0, fontFamily: "monospace" }}>
                      {invoiceData.invoiceId}
                    </p>
                  </div>
                  <button onClick={copyId} style={{
                    padding: "5px 11px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px",
                    background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                    color: copied ? "#4ade80" : "#818cf8", transition: "all 0.2s",
                  }}>
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => window.open(invoiceData.invoicePdf, "_blank")} style={{
                    flex: 1, padding: "13px",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    border: "none", borderRadius: "10px", color: "white",
                    fontWeight: "700", fontSize: "14px", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                  }}>
                    ↓ Download PDF
                  </button>
                  <button onClick={handleReset} style={{
                    flex: 1, padding: "13px",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "10px", color: "#94a3b8", fontWeight: "600",
                    fontSize: "14px", cursor: "pointer",
                  }}>
                    + New Invoice
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        <p style={{ textAlign: "center", color: "#1e293b", fontSize: "12px", marginTop: "16px" }}>
          Secured by Stripe · End-to-end encrypted
        </p>
      </div>
    </div>
  );
};

const Field = ({ label, name, placeholder, value, onChange, error, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", pointerEvents: "none" }}>
        {icon}
      </span>
      <input name={name} placeholder={placeholder} value={value} onChange={onChange}
        style={{ ...inp, paddingLeft: "33px", border: error ? "1px solid #ef4444" : inp.border }} />
    </div>
    {error && <p style={errStyle}>{error}</p>}
  </div>
);

const Spinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.75s linear infinite" }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const inp = {
  width: "100%", padding: "11px 13px", borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(15,23,42,0.7)", color: "#f1f5f9",
  fontSize: "14px", outline: "none", boxSizing: "border-box",
};
const labelStyle = { fontSize: "11px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" };
const errStyle = { color: "#ef4444", fontSize: "11px", margin: "2px 0 0" };

export default InvoiceGenerator;