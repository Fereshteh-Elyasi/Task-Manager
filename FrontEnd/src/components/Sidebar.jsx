import { useAuth } from "../auth/AuthContext";
import { roleLabels } from "../data/mockData";
import Avatar from "./Avatar";
import { NavIcon } from "./Icons";
import "./Sidebar.css";

const navItems = [
  { id: "home", label: "خانه" },
  { id: "inbox", label: "صندوق ورودی" },
  { id: "boards", label: "بردهای من" },
  { id: "calendar", label: "تقویم" },
  { id: "reports", label: "گزارش‌ها" },
  { id: "userManagement", label: "مدیریت کاربران" },
];

export default function Sidebar({
  page,
  onNavigate,
  projectsList,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  inboxCount,
  onInvite,
  onOpenProfile,
  isMobileOpen,
  onCloseMobile,
}) {
  const { users, currentUser, logout } = useAuth();

  return (
    <>
      {isMobileOpen && <div className="sidebar__scrim" onClick={onCloseMobile} />}
      <aside className={"sidebar" + (isMobileOpen ? " is-open" : "")}>
        <div className="sidebar__workspace">
          <span className="sidebar__logo">▤</span>
          <div>
            <p className="sidebar__workspace-name">Taskline</p>
            <p className="sidebar__workspace-sub">تیم محصول</p>
          </div>
          <button className="sidebar__mobile-close" onClick={onCloseMobile} type="button" aria-label="بستن منو">
            ×
          </button>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={"sidebar__nav-item" + (page === item.id ? " is-active" : "")}
              type="button"
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar__nav-icon"><NavIcon id={item.id} /></span>
              <span className="sidebar__nav-label">{item.label}</span>
              {item.id === "inbox" && inboxCount > 0 && (
                <span className="sidebar__nav-badge">{inboxCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar__section">
          <p className="sidebar__section-title">پروژه‌ها</p>
          <div className="sidebar__projects">
            {projectsList.map((p) => (
              <button
                key={p.id}
                type="button"
                className={
                  "sidebar__project" +
                  (p.id === activeProjectId && page === "boards" ? " is-active" : "")
                }
                onClick={() => onSelectProject(p.id)}
              >
                <span className="sidebar__project-icon">{p.name?.[0] || "؟"}</span>
                <span className="sidebar__project-name">{p.name}</span>
              </button>
            ))}
          </div>
          {currentUser.role !== "guest" && (
            <button className="sidebar__add-project" type="button" onClick={onCreateProject}>
              + پروژه جدید
            </button>
          )}
        </div>

        <div className="sidebar__section sidebar__team">
          <p className="sidebar__section-title">اعضای تیم</p>
          <div className="sidebar__avatars">
            {Object.values(users).map((m) => (
              <Avatar
                key={m.id}
                user={m}
                size={26}
                className="sidebar__avatar"
                title={`${m.name} — ${roleLabels[m.role]}`}
              />
            ))}
            {currentUser.role === "admin" && (
              <button
                className="sidebar__avatar sidebar__avatar--add"
                title="دعوت عضو جدید"
                type="button"
                onClick={onInvite}
              >
                +
              </button>
            )}
          </div>
        </div>

        <div className="sidebar__user">
          <button className="sidebar__user-info" type="button" onClick={onOpenProfile}>
            <Avatar user={currentUser} size={30} className="sidebar__user-avatar" />
            <div className="sidebar__user-meta">
              <p className="sidebar__user-name">{currentUser.name}</p>
              <p className="sidebar__user-role">{roleLabels[currentUser.role]}</p>
            </div>
          </button>
          <button className="sidebar__logout" onClick={logout} title="خروج" type="button">
            ⏻
          </button>
        </div>
      </aside>
    </>
  );
}
