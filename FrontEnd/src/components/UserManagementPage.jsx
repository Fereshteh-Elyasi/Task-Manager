import { useEffect, useMemo, useState } from "react";
import Avatar from "./Avatar";
import { roleLabels } from "../data/mockData";
import "./UserManagementPage.css";

export default function UserManagementPage({
  projectsList,
  projectMembers,
  boardsData,
  currentUser,
  allUsers,
  onLoadMembers,
  onLoadBoard,
  onRemoveMember,
  onAddMember,
  onUpdateUserRole,
  onInvite,
  onOpenProfile,
}) {
  const isAdmin = currentUser.role === "admin";
  const [search, setSearch] = useState("");
  const [addTarget, setAddTarget] = useState({}); // { [userId]: projectId }

  // اعضای همه‌ی پروژه‌ها را بگیر تا بشه فهمید هر کاربر کجاست
  useEffect(() => {
    projectsList.forEach((p) => {
      if (!projectMembers[p.id]) onLoadMembers(p.id);
    });
  }, [projectsList]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    const list = Object.values(allUsers || {}).map((u) => {
      const projects = projectsList
        .filter((p) => projectMembers[p.id]?.[u.id])
        .map((p) => ({
          id: p.id,
          name: p.name,
          projectRole: projectMembers[p.id][u.id].projectRole,
        }));
      return { ...u, projects };
    });
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [allUsers, projectsList, projectMembers, search]);

  async function handleRemove(userId, projectId) {
    if (!confirm("این عضو از پروژه حذف شود؟")) return;
    const result = await onRemoveMember(projectId, userId);
    if (result && !result.ok) alert(result.error);
  }

  async function handleAdd(userId) {
    const projectId = addTarget[userId];
    if (!projectId) return;
    const result = await onAddMember(projectId, userId);
    if (result && !result.ok) alert(result.error);
    setAddTarget((prev) => ({ ...prev, [userId]: "" }));
  }

  async function handleRoleChange(userId, role) {
    const result = await onUpdateUserRole(userId, role);
    if (result && !result.ok) alert(result.error);
  }

  return (
    <div className="user-mgmt">
      <div className="user-mgmt__content user-mgmt__content--full">
        <div className="user-mgmt__header">
          <h2>کاربران و پروژه‌ها</h2>
          {isAdmin && (
            <button type="button" className="user-mgmt__invite-btn" onClick={() => onInvite(null)}>
              + دعوت عضو جدید
            </button>
          )}
        </div>

        <input
          className="user-mgmt__search"
          type="text"
          placeholder="جست‌وجوی نام یا ایمیل…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {!isAdmin && (
          <p className="user-mgmt__hint">
            این‌جا می‌تونی ببینی هر عضو تو کدوم پروژه‌هاست. تغییر دادن این لیست فقط با ادمینه.
          </p>
        )}

        <div className="user-mgmt__list">
          {rows.length === 0 && <p className="user-mgmt__empty">کسی با این مشخصات پیدا نشد.</p>}

          {rows.map((u) => {
            const memberProjectIds = new Set(u.projects.map((p) => p.id));
            const availableProjects = projectsList.filter((p) => !memberProjectIds.has(p.id));

            return (
              <div key={u.id} className="user-mgmt__member user-mgmt__member--row">
                <button
                  type="button"
                  className="user-mgmt__member-identity"
                  onClick={() => onOpenProfile(u.id)}
                >
                  <Avatar user={u} size={36} />
                  <span>
                    <span className="user-mgmt__member-name">{u.name}</span>
                    <span className="user-mgmt__member-email">{u.email}</span>
                  </span>
                </button>

                {isAdmin ? (
                  <select
                    className="user-mgmt__role-select"
                    value={u.role}
                    disabled={u.id === currentUser.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="admin">ادمین</option>
                    <option value="member">عضو</option>
                    <option value="guest">مهمان</option>
                  </select>
                ) : (
                  <span className="user-mgmt__member-role">{roleLabels[u.role] || u.role}</span>
                )}

                <div className="user-mgmt__project-chips">
                  {u.projects.length === 0 && (
                    <span className="user-mgmt__no-projects">عضو هیچ پروژه‌ای نیست</span>
                  )}
                  {u.projects.map((p) => (
                    <span key={p.id} className="user-mgmt__chip">
                      {p.name}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleRemove(u.id, p.id)}
                          aria-label="حذف از پروژه"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}

                  {isAdmin && availableProjects.length > 0 && (
                    <span className="user-mgmt__add-inline">
                      <select
                        value={addTarget[u.id] || ""}
                        onChange={(e) =>
                          setAddTarget((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                      >
                        <option value="">افزودن به پروژه…</option>
                        {availableProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!addTarget[u.id]}
                        onClick={() => handleAdd(u.id)}
                      >
                        افزودن
                      </button>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
