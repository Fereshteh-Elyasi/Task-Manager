import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "./Topbar.css";

const pageTitles = {
  home: "خانه",
  inbox: "صندوق ورودی",
  calendar: "تقویم",
  reports: "گزارش‌ها",
};

export default function Topbar({
  boardTitle,
  page,
  view,
  onViewChange,
  onNewTask,
  canCreate,
  searchQuery,
  onSearchChange,
  onOpenMobileNav,
  onRenameBoard,
}) {
  const { currentUser } = useAuth();
  const isBoardPage = page === "boards";
  const title = isBoardPage ? boardTitle : pageTitles[page] || boardTitle;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(boardTitle || "");

  useEffect(() => {
    if (!editing) setDraft(boardTitle || "");
  }, [boardTitle, editing]);

  const canEditTitle =
    isBoardPage &&
    typeof onRenameBoard === "function" &&
    currentUser?.role !== "guest";

  async function commitTitle() {
    const next = (draft || "").trim();
    setEditing(false);
    if (!next || next === boardTitle) {
      setDraft(boardTitle || "");
      return;
    }
    try {
      await onRenameBoard(next);
    } catch (e) {
      alert(e.message || "تغییر نام ناموفق بود.");
      setDraft(boardTitle || "");
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__title-row">
        <button
          className="topbar__mobile-menu"
          type="button"
          onClick={onOpenMobileNav}
          aria-label="باز کردن منو"
        >
          ☰
        </button>

        {editing ? (
          <input
            className="topbar__title-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitTitle();
              }
              if (e.key === "Escape") {
                setDraft(boardTitle || "");
                setEditing(false);
              }
            }}
          />
        ) : (
          <h1 className="topbar__title">
            {title}
            {canEditTitle && (
              <button
                type="button"
                className="topbar__edit-title"
                title="تغییر نام پروژه"
                onClick={() => setEditing(true)}
              >
                ✎
              </button>
            )}
          </h1>
        )}
      </div>

      {isBoardPage && (
        <div className="topbar__controls">
          <div className="topbar__search">
            <span className="topbar__search-icon">⌕</span>
            <input
              placeholder="جست‌وجوی تسک…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                className="topbar__search-clear"
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="پاک کردن جست‌وجو"
              >
                ×
              </button>
            )}
          </div>

          <div className="topbar__view-switch">
            <button
              className={view === "board" ? "is-active" : ""}
              onClick={() => onViewChange("board")}
              type="button"
            >
              بورد
            </button>
            <button
              className={view === "list" ? "is-active" : ""}
              onClick={() => onViewChange("list")}
              type="button"
            >
              لیست
            </button>
          </div>

          {canCreate && (
            <button className="topbar__new-btn" onClick={onNewTask} type="button">
              + تسک جدید
            </button>
          )}
        </div>
      )}
    </header>
  );
}
