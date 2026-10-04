import { useState } from "react";
import { roleLabels } from "../data/mockData";
import "./ProjectModal.css";

/**
 * دو حالت:
 * - addToProject: فقط اضافه کردن کاربر موجود به پروژه فعلی (با ایمیل)
 * - createUser: ساخت کاربر جدید در سیستم (ادمین) + اختیاری عضویت در پروژه
 */
export default function InviteModal({ onClose, onInvite, projectName }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [mode, setMode] = useState("addToProject"); // addToProject | createUser
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const result = await onInvite({
        name: name.trim(),
        email: email.trim(),
        role,
        mode,
      });
      if (result && !result.ok) {
        setError(result.error || "عملیات ناموفق بود.");
      } else if (result?.tempPassword) {
        setInfo(`عضو اضافه شد. رمز موقت: ${result.tempPassword}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="project-modal__backdrop" onClick={onClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal__header">
          <h2>دعوت / افزودن عضو</h2>
          <button className="project-modal__close" onClick={onClose} aria-label="بستن" type="button">
            ×
          </button>
        </div>

        {projectName && (
          <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 12px" }}>
            پروژه فعال: <strong>{projectName}</strong>
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginBottom: 14,
            padding: 4,
            background: "var(--bg-muted, #f3f1f8)",
            borderRadius: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setMode("addToProject")}
            style={{
              border: "none",
              borderRadius: 8,
              padding: "8px 10px",
              fontFamily: "inherit",
              fontWeight: 600,
              cursor: "pointer",
              background: mode === "addToProject" ? "#fff" : "transparent",
              color: mode === "addToProject" ? "var(--violet, #6C4CF1)" : "inherit",
              boxShadow: mode === "addToProject" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
            }}
          >
            افزودن به پروژه
          </button>
          <button
            type="button"
            onClick={() => setMode("createUser")}
            style={{
              border: "none",
              borderRadius: 8,
              padding: "8px 10px",
              fontFamily: "inherit",
              fontWeight: 600,
              cursor: "pointer",
              background: mode === "createUser" ? "#fff" : "transparent",
              color: mode === "createUser" ? "var(--violet, #6C4CF1)" : "inherit",
              boxShadow: mode === "createUser" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
            }}
          >
            ساخت کاربر جدید
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "createUser" && (
            <label className="project-modal__field">
              <span>نام و نام‌خانوادگی</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={busy}
              />
            </label>
          )}

          <label className="project-modal__field">
            <span>ایمیل {mode === "addToProject" ? "(باید قبلاً ثبت‌نام کرده باشد)" : ""}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={busy}
              autoFocus={mode === "addToProject"}
            />
          </label>

          <label className="project-modal__field">
            <span>نقش سیستمی</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} disabled={busy}>
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p style={{ color: "var(--coral)", fontSize: "12px", margin: "-6px 0 12px" }}>
              {error}
            </p>
          )}
          {info && (
            <p style={{ color: "var(--sage, #2FAE7C)", fontSize: "12px", margin: "-6px 0 12px" }}>
              {info}
            </p>
          )}

          <button className="project-modal__submit" type="submit" disabled={busy}>
            {busy
              ? "لطفاً صبر کنید…"
              : mode === "addToProject"
                ? "افزودن به این پروژه"
                : "ساخت و دعوت"}
          </button>
        </form>
      </div>
    </div>
  );
}
