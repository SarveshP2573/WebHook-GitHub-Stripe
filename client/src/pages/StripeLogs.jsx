import { useEffect, useState } from "react";
import axios from "axios";

const StripeLogs = ({ onBack }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stripe/logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={onBack}>
        ⬅ Back
      </button>

      <h2 style={styles.heading}>📜 Stripe Webhook Logs</h2>

      {logs.length === 0 ? (
        <p style={styles.noLogs}>No logs available...</p>
      ) : (
        logs.map((log, index) => (
          <div key={index} style={styles.card}>
            <p><strong>Event:</strong> {log.type}</p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    marginBottom: "20px",
    color: "#333",
  },
  backBtn: {
    backgroundColor: "#635BFF",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    marginBottom: "15px",
  },
  noLogs: {
    color: "#777",
  },
};

export default StripeLogs;
