import { useState } from "react";

const Notifications = ({ onBack }) => {
  const [successAlert, setSuccessAlert] = useState(true);
  const [failureAlert, setFailureAlert] = useState(true);

  const savePreferences = () => {
    alert("Preferences Saved Successfully ✅");
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={onBack}>
        ⬅ Back
      </button>

      <h2 style={styles.heading}>🔔 Custom Notifications</h2>

      <div style={styles.card}>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={successAlert}
            onChange={() => setSuccessAlert(!successAlert)}
          />
          &nbsp; Payment Success Alerts
        </label>

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={failureAlert}
            onChange={() => setFailureAlert(!failureAlert)}
          />
          &nbsp; Payment Failure Alerts
        </label>

        <button style={styles.saveBtn} onClick={savePreferences}>
          Save Preferences
        </button>
      </div>
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
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "400px",
  },
  label: {
    fontSize: "16px",
  },
  saveBtn: {
    backgroundColor: "#00C853",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Notifications;
