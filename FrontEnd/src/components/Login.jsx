import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { roleLabels } from "../data/mockData";
import "./Login.css";

const DEMO_ACCOUNTS = [
  { id: "u-1", name: "سارا احمدی", email: "sara@taskline.dev", color: "#6C4CF1", role: "admin" },
  { id: "u-2", name: "رضا کریمی", email: "reza@taskline.dev", color: "#2FAE7C", role: "member" },
  { id: "u-3", name: "نگار محمدی", email: "negar@taskline.dev", color: "#FF6B4A", role: "member" },
  { id: "u-4", name: "امیر رستمی", email: "amir@taskline.dev", color: "#E0A419", role: "guest" },
];

export default function Login() {
  const { login, signup, loginAsDemo } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name.trim()) {
        setError("نام را وارد کنید.");
        return;
      }
      if (password.length < 4) {
        setError("رمز عبور باید حداقل ۴ کاراکتر باشد.");
        return;
      }
      if (password !== password2) {
        setError("رمز عبور و تکرار آن یکسان نیستند.");
        return;
      }
    }

    setBusy(true);
    try {
      const result =
        mode === "login"
          ? await login(email.trim(), password)
          : await signup({ name: name.trim(), email: email.trim(), password });
      if (!result.ok) setError(result.error || "عملیات ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDemo(account) {
    setError("");
    setBusy(true);
    try {
      const result = await loginAsDemo(account.email);
      if (!result.ok) {
        setError(result.error || "ورود دمو ناموفق بود.");
      }
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setPassword("");
    setPassword2("");
  }

  return (
    <div className="login">
      <div className="login__panel">
        <div className="login__brand">
          <span className="login__logo">▤</span>
          <span>Taskline</span>
        </div>
        <h1 className="login__title">
          {mode === "login" ? "ورود به فضای کاری" : "ساخت حساب جدید"}
        </h1>
        <p className="login__subtitle">
          {mode === "login"
            ? "اگر قبلاً ثبت‌نام کرده‌اید، وارد شوید."
            : "نام، ایمیل و رمز خودت را بگذار — بعداً از پنل پروفایل قابل تغییر است."}
        </p>

        <div className="login__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`login__tab ${mode === "login" ? "is-active" : ""}`}
            onClick={() => switchMode("login")}
            disabled={busy}
          >
            ورود
          </button>
          <button
            type="button"
            role="tab"
            className={`login__tab ${mode === "signup" ? "is-active" : ""}`}
            onClick={() => switchMode("signup")}
            disabled={busy}
          >
            ثبت‌نام
          </button>
        </div>

        <form className="login__form" onSubmit={submit} autoComplete="on">
          {mode === "signup" && (
            <label className="login__field">
              <span>نام و نام‌خانوادگی</span>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً فرشته الیاسی"
                required
                disabled={busy}
                autoComplete="name"
              />
            </label>
          )}
          <label className="login__field">
            <span>ایمیل</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={busy}
              autoComplete="email"
            />
          </label>
          <label className="login__field">
            <span>رمز عبور</span>
            <input
              type="password"
              name={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "حداقل ۴ کاراکتر" : ""}
              required
              disabled={busy}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={mode === "signup" ? 4 : undefined}
            />
          </label>
          {mode === "signup" && (
            <label className="login__field">
              <span>تکرار رمز عبور</span>
              <input
                type="password"
                name="confirm-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                disabled={busy}
                autoComplete="new-password"
                minLength={4}
              />
            </label>
          )}

          {error && <p className="login__error">{error}</p>}

          <button className="login__submit" type="submit" disabled={busy}>
            {busy
              ? "لطفاً صبر کنید…"
              : mode === "login"
                ? "ورود"
                : "ثبت‌نام و ورود"}
          </button>
        </form>

        <div className="login__demo">
          <p className="login__demo-title">حساب‌های آزمایشی (رمز همه: 1234)</p>
          <div className="login__demo-list">
            {DEMO_ACCOUNTS.map((u) => (
              <button
                key={u.id}
                className="login__demo-user"
                onClick={() => handleDemo(u)}
                disabled={busy}
                type="button"
              >
                <span className="login__demo-avatar" style={{ background: u.color }}>
                  {u.name[0]}
                </span>
                <span className="login__demo-meta">
                  <span className="login__demo-name">{u.name}</span>
                  <span className="login__demo-role">{roleLabels[u.role]}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="login__side">
        <div className="login__side-card">
          <p className="login__side-eyebrow">پیش‌نمایش بورد</p>
          <div className="login__side-column">
            <span className="login__side-dot" />
            در حال انجام
          </div>
          <div className="login__side-task">
            <span className="login__side-bar" />
            طراحی رابط کاربری کارت‌ها
          </div>
          <div className="login__side-task">
            <span className="login__side-bar" style={{ background: "var(--coral)" }} />
            بازبینی امنیتی API
          </div>
        </div>
      </div>
    </div>
  );
}
