import { useState } from "react";
import "./ProjectModal.css";

export default function ProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");

  function submit(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    onCreate({ name: clean });
  }

  return (
    <div className="project-modal__backdrop" onClick={onClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal__header">
          <h2>پروژه جدید</h2>
          <button className="project-modal__close" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <label className="project-modal__field">
            <span>نام پروژه</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً وب‌سایت شرکت"
              required
            />
          </label>

          <button className="project-modal__submit" type="submit">
            ساخت پروژه
          </button>
        </form>
      </div>
    </div>
  );
}
