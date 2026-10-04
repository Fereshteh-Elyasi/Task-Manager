import { useState } from "react";
import { roleLabels } from "../data/mockData";
import { useAuth } from "../auth/AuthContext";
import Avatar from "./Avatar";
import { IconCamera } from "./Icons";
import "./ProjectModal.css";
import "./ProfileModal.css";

export default function ProfileModal({ onClose }) {
  const { currentUser, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(currentUser.name);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    updateProfile({ avatarUrl: null });
  }

  async function saveName(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const result = await updateProfile({ name: trimmed });
    if (result?.ok === false) {
      alert(result.error || "ذخیره نام ناموفق بود.");
      return;
    }
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1800);
  }

  async function submitPassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSaved(false);
    if (newPassword.length < 4) {
      setPwError("رمز جدید باید حداقل ۴ کاراکتر باشد.");
      return;
    }
    const result = await changePassword(currentPassword, newPassword);
    if (!result.ok) {
      setPwError(result.error);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 1800);
  }

  return (
    <div className="project-modal__backdrop" onClick={onClose}>
      <div className="project-modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal__header">
          <h2>مدیریت اکانت</h2>
          <button className="project-modal__close" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </div>

        <div className="profile-modal__avatar-row">
          <Avatar user={currentUser} size={72} />
          <div className="profile-modal__avatar-actions">
            <label className="profile-modal__upload-btn">
              <IconCamera s={15} /> آپلود عکس
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </label>
            {currentUser.avatar && (
              <button
                type="button"
                className="profile-modal__remove-btn"
                onClick={removeAvatar}
              >
                حذف عکس
              </button>
            )}
          </div>
        </div>

        <div className="profile-modal__meta">
          <span className="profile-modal__email">{currentUser.email}</span>
          <span className="profile-modal__role">{roleLabels[currentUser.role]}</span>
        </div>

        <form onSubmit={saveName} className="profile-modal__section">
          <label className="project-modal__field">
            <span>نام و نام‌خانوادگی</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <button className="project-modal__submit profile-modal__submit-sm" type="submit">
            {nameSaved ? "ذخیره شد ✓" : "ذخیره نام"}
          </button>
        </form>

        <form onSubmit={submitPassword} className="profile-modal__section">
          <p className="profile-modal__section-title">تغییر رمز عبور</p>
          <label className="project-modal__field">
            <span>رمز عبور فعلی</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label className="project-modal__field">
            <span>رمز عبور جدید</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          {pwError && <p className="profile-modal__error">{pwError}</p>}
          <button className="project-modal__submit profile-modal__submit-sm" type="submit">
            {pwSaved ? "رمز تغییر کرد ✓" : "تغییر رمز عبور"}
          </button>
        </form>
      </div>
    </div>
  );
}
