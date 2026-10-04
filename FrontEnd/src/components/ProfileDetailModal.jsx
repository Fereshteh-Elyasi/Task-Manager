import { useEffect, useState } from "react";
import { roleLabels } from "../data/mockData";
import Avatar from "./Avatar";
import api from "../api/client";
import "./ProjectModal.css";
import "./ProfileDetailModal.css";

export default function ProfileDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .getUser(userId)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="project-modal__backdrop" onClick={onClose}>
      <div className="project-modal profile-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal__header">
          <h2>مشخصات کاربر</h2>
          <button className="project-modal__close" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </div>

        {loading && <p className="profile-detail-modal__hint">در حال بارگذاری…</p>}
        {error && <p className="profile-detail-modal__error">{error}</p>}

        {user && (
          <>
            <div className="profile-detail-modal__head">
              <Avatar user={user} size={64} />
              <div>
                <p className="profile-detail-modal__name">{user.name}</p>
                <p className="profile-detail-modal__email">{user.email}</p>
                <span className="profile-detail-modal__role">{roleLabels[user.role] || user.role}</span>
              </div>
            </div>

            <div className="profile-detail-modal__row">
              <span className="profile-detail-modal__label">تاریخ عضویت</span>
              <span>{user.createdAt || "—"}</span>
            </div>

            <div className="profile-detail-modal__projects">
              <p className="profile-detail-modal__section-title">
                همکاری در پروژه‌ها ({user.projects?.length || 0})
              </p>
              {(!user.projects || user.projects.length === 0) && (
                <p className="profile-detail-modal__hint">عضو هیچ پروژه‌ای نیست.</p>
              )}
              {user.projects?.map((p) => (
                <div key={p.id} className="profile-detail-modal__project-item">
                  <span className="profile-detail-modal__project-name">{p.name}</span>
                  <span className="profile-detail-modal__project-role">{p.projectRole}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
