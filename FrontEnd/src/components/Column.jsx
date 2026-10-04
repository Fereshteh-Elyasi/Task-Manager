import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { useAuth } from "../auth/AuthContext";
import "./Column.css";

const dotColors = {
  "برای انجام": "var(--ink-faint)",
  "در حال انجام": "var(--violet)",
  بازبینی: "var(--amber)",
  "انجام‌شده": "var(--sage)",
};

export default function Column({
  labelsMap,
  column,
  tasks,
  onOpenTask,
  onAddTask,
  onDeleteColumn,
  onRenameColumn,
  hideAddControls,
}) {
  const { currentUser } = useAuth();
  const canCreate = currentUser?.role !== "guest";
  const canEdit = currentUser?.role !== "guest";
  const canDelete = currentUser?.role === "admin" || currentUser?.role === "member";
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } });

  function submit(e) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) {
      setAdding(false);
      return;
    }
    onAddTask(column.id, title);
    setDraft("");
    setAdding(false);
  }

  function handleDelete() {
    if (!canDelete || !onDeleteColumn) return;
    const msg =
      tasks.length > 0
        ? `ستون «${column.title}» و ${tasks.length} تسک داخلش حذف می‌شوند. مطمئنی؟`
        : `ستون «${column.title}» حذف شود؟`;
    if (window.confirm(msg)) {
      onDeleteColumn(column.id);
    }
  }

  async function commitTitle() {
    setEditingTitle(false);
    const next = (titleDraft || "").trim();
    if (!next || next === column.title) {
      setTitleDraft(column.title);
      return;
    }
    if (typeof onRenameColumn === "function") {
      try {
        await onRenameColumn(column.id, next);
      } catch (e) {
        alert(e.message || "تغییر نام ستون ناموفق بود.");
        setTitleDraft(column.title);
      }
    }
  }

  return (
    <div className="column">
      <div className="column__header">
        <span
          className="column__dot"
          style={{ background: dotColors[column.title] || "var(--ink-faint)" }}
        />
        {editingTitle ? (
          <input
            className="column__title-input"
            value={titleDraft}
            autoFocus
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitTitle();
              }
              if (e.key === "Escape") {
                setTitleDraft(column.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <h2
            className="column__title"
            onDoubleClick={() => {
              if (canEdit && onRenameColumn) {
                setTitleDraft(column.title);
                setEditingTitle(true);
              }
            }}
            title={canEdit ? "دوبار کلیک برای تغییر نام" : undefined}
          >
            {column.title}
            {canEdit && onRenameColumn && (
              <button
                type="button"
                className="column__edit-title"
                onClick={() => {
                  setTitleDraft(column.title);
                  setEditingTitle(true);
                }}
                title="تغییر نام ستون"
              >
                ✎
              </button>
            )}
          </h2>
        )}
        <span className="column__count">{tasks.length}</span>
        {canCreate && (
          <button className="column__header-add" onClick={() => setAdding(true)} type="button" title="افزودن تسک">
            +
          </button>
        )}
        {canDelete && onDeleteColumn && (
          <button
            className="column__header-delete"
            onClick={handleDelete}
            type="button"
            title="حذف ستون"
          >
            ×
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={"column__body" + (isOver ? " column__body--over" : "")}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard labelsMap={labelsMap} key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <p className="column__empty">تسکی اینجا نیست — یکی اضافه کن.</p>
        )}

        {canCreate && adding && !hideAddControls && (
          <form className="column__add-form" onSubmit={submit}>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submit}
              placeholder="عنوان تسک…"
              className="column__add-input"
            />
          </form>
        )}

        {canCreate && !adding && !hideAddControls && (
          <button className="column__add-btn" onClick={() => setAdding(true)} type="button">
            + افزودن تسک
          </button>
        )}
      </div>
    </div>
  );
}
