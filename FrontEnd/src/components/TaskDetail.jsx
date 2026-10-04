import { useState } from "react";
import { priorities, labels as defaultLabels } from "../data/mockData";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Avatar from "./Avatar";
import DatePickerModal from "./DatePickerModal";
import { isOverdue } from "../utils/jalaliCalendar";
import { IconPaperclip, IconFile } from "./Icons";
import "./TaskDetail.css";

export default function TaskDetail({
  task,
  onClose,
  onSave,
  onDelete,
  labelsMap,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
  projectMembers,
}) {
  const labels = labelsMap || defaultLabels;
  const { users, currentUser } = useAuth();
  // اگر لیست اعضای پروژه هنوز لود نشده، فرض می‌کنیم مجاز است (چک واقعی همیشه سمت سرور انجام می‌شود)
  const isProjectMember =
    !projectMembers || currentUser.role === "admin" || Boolean(projectMembers[currentUser.id]);
  const canEdit = currentUser.role !== "guest" && isProjectMember;
  const canDelete = currentUser.role === "admin";

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
  const [labelIds, setLabelIds] = useState(task.labelIds || []);
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newItem, setNewItem] = useState("");
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");
  const [comments, setComments] = useState(task.comments || []);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [manageLabels, setManageLabels] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelName, setEditingLabelName] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#6C4CF1");
  const labelColorChoices = ["#6C4CF1", "#2FAE7C", "#FF6B4A", "#E0A419", "#2F8FE0", "#C13584"];

  function persist(patch) {
    if (!canEdit && !("comments" in patch) && !("attachments" in patch)) return;
    const updated = {
      ...task,
      title,
      description,
      priority,
      dueDate,
      assigneeId,
      labelIds,
      checklist,
      comments,
      attachments,
      ...patch,
    };
    onSave(updated);
  }

  function toggleLabel(id) {
    if (!canEdit) return;
    const next = labelIds.includes(id)
      ? labelIds.filter((l) => l !== id)
      : [...labelIds, id];
    setLabelIds(next);
    persist({ labelIds: next });
  }

  function startEditLabel(l) {
    setEditingLabelId(l.id);
    setEditingLabelName(l.name);
  }

  async function saveLabelEdit(id) {
    const name = editingLabelName.trim();
    setEditingLabelId(null);
    if (!name) return;
    const result = await onUpdateLabel?.(id, { name });
    if (result && !result.ok) alert(result.error);
  }

  async function changeLabelColor(id, color) {
    const result = await onUpdateLabel?.(id, { color });
    if (result && !result.ok) alert(result.error);
  }

  async function deleteLabelHandler(id) {
    const result = await onDeleteLabel?.(id);
    if (result && !result.ok) {
      alert(result.error);
      return;
    }
    if (labelIds.includes(id)) {
      const next = labelIds.filter((l) => l !== id);
      setLabelIds(next);
      persist({ labelIds: next });
    }
  }

  async function addNewLabel(e) {
    e.preventDefault();
    const name = newLabelName.trim();
    if (!name) return;
    const result = await onCreateLabel?.({ name, color: newLabelColor });
    if (result && !result.ok) {
      alert(result.error);
      return;
    }
    setNewLabelName("");
  }

  function toggleChecklistItem(id) {
    if (!canEdit) return;
    const item = checklist.find((c) => c.id === id);
    const next = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
    setChecklist(next);
    persist({ checklist: next });
    if (item) {
      api.updateChecklist(id, { done: !item.done }).catch(console.error);
    }
  }

  async function addChecklistItem(e) {
    e.preventDefault();
    if (!canEdit) return;
    const text = newItem.trim();
    if (!text) return;
    setNewItem("");
    try {
      const item = await api.addChecklist(task.id, text);
      const next = [...checklist, item];
      setChecklist(next);
      persist({ checklist: next });
    } catch (err) {
      alert(err.message);
    }
  }

  function startEditChecklist(item) {
    if (!canEdit) return;
    setEditingChecklistId(item.id);
    setEditingChecklistText(item.text);
  }

  async function saveChecklistEdit() {
    const id = editingChecklistId;
    const text = editingChecklistText.trim();
    setEditingChecklistId(null);
    if (!id || !text) return;
    const prevItem = checklist.find((c) => c.id === id);
    if (!prevItem || prevItem.text === text) return;
    const next = checklist.map((c) => (c.id === id ? { ...c, text } : c));
    setChecklist(next);
    persist({ checklist: next });
    try {
      await api.updateChecklist(id, { text });
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteChecklistItem(id) {
    if (!canEdit) return;
    const next = checklist.filter((c) => c.id !== id);
    setChecklist(next);
    persist({ checklist: next });
    try {
      await api.deleteChecklist(id);
    } catch (err) {
      alert(err.message);
    }
  }

  async function addComment(e) {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    setNewComment("");
    try {
      const cm = await api.addComment(task.id, text);
      const next = [...comments, cm];
      setComments(next);
      persist({ comments: next });
    } catch (err) {
      alert(err.message);
    }
  }

  function startEditComment(c) {
    setEditingCommentId(c.id);
    setEditingCommentText(c.text);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentText("");
  }

  async function saveCommentEdit() {
    const id = editingCommentId;
    const text = editingCommentText.trim();
    setEditingCommentId(null);
    if (!id || !text) return;
    const prevComment = comments.find((c) => c.id === id);
    if (!prevComment || prevComment.text === text) return;
    const next = comments.map((c) => (c.id === id ? { ...c, text } : c));
    setComments(next);
    persist({ comments: next });
    try {
      await api.updateComment(id, text);
    } catch (err) {
      alert(err.message);
      setComments(comments);
      persist({ comments });
    }
  }

  async function deleteCommentItem(id) {
    const next = comments.filter((c) => c.id !== id);
    setComments(next);
    persist({ comments: next });
    try {
      await api.deleteComment(id);
    } catch (err) {
      alert(err.message);
      setComments(comments);
      persist({ comments });
    }
  }

  async function handleFiles(fileList) {
    if (!canEdit) return;
    for (const file of Array.from(fileList)) {
      try {
        const att = await api.uploadAttachment(task.id, file);
        setAttachments((prev) => {
          const next = [...prev, att];
          persist({ attachments: next });
          return next;
        });
      } catch (err) {
        alert(err.message || "آپلود ناموفق بود.");
      }
    }
  }

  async function removeAttachment(id) {
    if (!canEdit) return;
    const next = attachments.filter((a) => a.id !== id);
    setAttachments(next);
    persist({ attachments: next });
    try {
      await api.deleteAttachment(id);
    } catch (err) {
      alert(err.message);
    }
  }

  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="task-detail__backdrop" onClick={onClose}>
      <aside className="task-detail" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail__header">
          <span className="task-detail__eyebrow">جزئیات تسک</span>
          <button className="task-detail__close" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </div>

        {!canEdit && (
          <p className="task-detail__readonly-note">
            دسترسی شما فقط مشاهده و ثبت کامنت است.
          </p>
        )}

        <input
          className="task-detail__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => persist({})}
          disabled={!canEdit}
        />

        <div className="task-detail__labels-header">
          <span className="task-detail__labels-title">دسته‌بندی‌ها</span>
          {canEdit && (
            <button
              type="button"
              className="task-detail__labels-manage-toggle"
              onClick={() => setManageLabels((v) => !v)}
            >
              {manageLabels ? "پایان ویرایش" : "مدیریت دسته‌بندی‌ها"}
            </button>
          )}
        </div>

        <div className="task-detail__labels">
          {Object.values(labels).map((l) => {
            const active = labelIds.includes(l.id);

            if (manageLabels) {
              return (
                <div key={l.id} className="task-detail__label-manage-item">
                  {editingLabelId === l.id ? (
                    <input
                      className="task-detail__label-edit-input"
                      value={editingLabelName}
                      autoFocus
                      onChange={(e) => setEditingLabelName(e.target.value)}
                      onBlur={() => saveLabelEdit(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); saveLabelEdit(l.id); }
                        if (e.key === "Escape") setEditingLabelId(null);
                      }}
                    />
                  ) : (
                    <span
                      className="task-detail__label-chip task-detail__label-chip--editable"
                      style={{ "--chip-color": l.color }}
                      onClick={() => startEditLabel(l)}
                    >
                      {l.name}
                    </span>
                  )}
                  <span className="task-detail__label-color-choices">
                    {labelColorChoices.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={"task-detail__label-color-dot" + (l.color === c ? " is-selected" : "")}
                        style={{ background: c }}
                        aria-label="تغییر رنگ"
                        onClick={() => changeLabelColor(l.id, c)}
                      />
                    ))}
                  </span>
                  <button
                    type="button"
                    className="task-detail__label-remove"
                    onClick={() => deleteLabelHandler(l.id)}
                    aria-label="حذف دسته‌بندی"
                  >
                    ×
                  </button>
                </div>
              );
            }

            return (
              <button
                key={l.id}
                type="button"
                disabled={!canEdit}
                className={"task-detail__label-chip" + (active ? " is-active" : "")}
                style={{ "--chip-color": l.color }}
                onClick={() => toggleLabel(l.id)}
              >
                {l.name}
              </button>
            );
          })}
        </div>

        {manageLabels && (
          <form className="task-detail__label-add-form" onSubmit={addNewLabel}>
            <span className="task-detail__label-color-choices">
              {labelColorChoices.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={"task-detail__label-color-dot" + (newLabelColor === c ? " is-selected" : "")}
                  style={{ background: c }}
                  aria-label="انتخاب رنگ"
                  onClick={() => setNewLabelColor(c)}
                />
              ))}
            </span>
            <input
              className="task-detail__label-add-input"
              placeholder="دسته‌بندی جدید…"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
            />
            <button type="submit" className="task-detail__label-add-submit">
              افزودن
            </button>
          </form>
        )}

        <textarea
          className="task-detail__desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => persist({})}
          placeholder="توضیحات…"
          rows={5}
          disabled={!canEdit}
        />

        <div className="task-detail__grid">
          <div className="task-detail__row">
            <label className="task-detail__label">اولویت</label>
            <div className="task-detail__priorities">
              {Object.entries(priorities).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  disabled={!canEdit}
                  className={"task-detail__priority-chip" + (priority === key ? " is-active" : "")}
                  style={{ "--chip-color": p.color }}
                  onClick={() => {
                    setPriority(key);
                    persist({ priority: key });
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="task-detail__row">
            <label className="task-detail__label">سررسید</label>
            <button
              type="button"
              className="task-detail__text-input task-detail__date-btn"
              disabled={!canEdit}
              onClick={() => canEdit && setShowDatePicker(true)}
            >
              {dueDate || "انتخاب از تقویم…"}
            </button>
            {isOverdue(dueDate) && (
              <span className="task-detail__overdue-badge">منقضی شده</span>
            )}
          </div>
        </div>

        <div className="task-detail__row">
          <label className="task-detail__label">مسئول</label>
          <div className="task-detail__assignees">
            {Object.values(projectMembers || users).map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={!canEdit}
                className={"task-detail__assignee" + (assigneeId === m.id ? " is-active" : "")}
                onClick={() => {
                  const next = assigneeId === m.id ? "" : m.id;
                  setAssigneeId(next);
                  persist({ assigneeId: next });
                }}
                title={m.name}
              >
                <Avatar user={m} size={22} className="task-detail__assignee-avatar" />
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="task-detail__row">
          <div className="task-detail__checklist-header">
            <label className="task-detail__label">چک‌لیست</label>
            {checklist.length > 0 && (
              <span className="task-detail__checklist-count">
                {doneCount}/{checklist.length}
              </span>
            )}
          </div>
          <div className="task-detail__checklist">
            {checklist.map((item) => (
              <div key={item.id} className="task-detail__checklist-item">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklistItem(item.id)}
                  disabled={!canEdit}
                />
                {editingChecklistId === item.id ? (
                  <input
                    className="task-detail__checklist-edit-input"
                    value={editingChecklistText}
                    autoFocus
                    onChange={(e) => setEditingChecklistText(e.target.value)}
                    onBlur={saveChecklistEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); saveChecklistEdit(); }
                      if (e.key === "Escape") setEditingChecklistId(null);
                    }}
                  />
                ) : (
                  <span
                    className={item.done ? "is-done" : ""}
                    onClick={() => startEditChecklist(item)}
                  >
                    {item.text}
                  </span>
                )}
                {canEdit && (
                  <button
                    type="button"
                    className="task-detail__checklist-remove"
                    onClick={() => deleteChecklistItem(item.id)}
                    aria-label="حذف مورد"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {canEdit && (
            <form className="task-detail__checklist-add" onSubmit={addChecklistItem}>
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="+ افزودن مورد"
              />
            </form>
          )}
        </div>

        <div className="task-detail__row">
          <div className="task-detail__checklist-header">
            <label className="task-detail__label">پیوست‌ها</label>
            {attachments.length > 0 && (
              <span className="task-detail__checklist-count">{attachments.length}</span>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="task-detail__attachments">
              {attachments.map((a) => (
                <div key={a.id} className="task-detail__attachment">
                  {(a.type?.startsWith("image/") || /\.(png|jpe?g|gif|webp)(\?|$)/i.test(a.url || a.name || "")) ? (
                    <img src={a.url || a.dataUrl} alt={a.name} className="task-detail__attachment-thumb" />
                  ) : (
                    <span className="task-detail__attachment-icon"><IconFile s={18} /></span>
                  )}
                  {a.url ? (
                    <a className="task-detail__attachment-name" href={a.url} target="_blank" rel="noreferrer">
                      {a.name}
                    </a>
                  ) : (
                    <span className="task-detail__attachment-name">{a.name}</span>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      className="task-detail__attachment-remove"
                      onClick={() => removeAttachment(a.id)}
                      aria-label="حذف پیوست"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canEdit && (
            <label className="task-detail__file-btn">
              <IconPaperclip s={15} /> افزودن عکس یا فایل
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.zip"
                onChange={(e) => handleFiles(e.target.files)}
                hidden
              />
            </label>
          )}
        </div>

        <div className="task-detail__row">
          <label className="task-detail__label">کامنت‌ها</label>
          <div className="task-detail__comments">
            {comments.length === 0 && (
              <p className="task-detail__no-comments">هنوز کامنتی ثبت نشده.</p>
            )}
            {comments.map((c) => {
              const author = users[c.authorId];
              const canModify = c.authorId === currentUser.id || currentUser.role === "admin";
              return (
                <div key={c.id} className="task-detail__comment">
                  <Avatar
                    user={author || { name: "؟", color: "var(--ink-faint)" }}
                    size={26}
                    className="task-detail__comment-avatar"
                  />
                  <div className="task-detail__comment-body">
                    <div className="task-detail__comment-meta">
                      <span className="task-detail__comment-author">{author?.name || "کاربر حذف‌شده"}</span>
                      <span className="task-detail__comment-time">{c.createdAt}</span>
                    </div>
                    {editingCommentId === c.id ? (
                      <input
                        className="task-detail__comment-edit-input"
                        value={editingCommentText}
                        autoFocus
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        onBlur={saveCommentEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); saveCommentEdit(); }
                          if (e.key === "Escape") cancelEditComment();
                        }}
                      />
                    ) : (
                      <p className="task-detail__comment-text">{c.text}</p>
                    )}
                    {canModify && editingCommentId !== c.id && (
                      <div className="task-detail__comment-actions">
                        <button type="button" onClick={() => startEditComment(c)}>
                          ویرایش
                        </button>
                        <button type="button" onClick={() => deleteCommentItem(c.id)}>
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <form className="task-detail__comment-form" onSubmit={addComment}>
            <Avatar user={currentUser} size={26} className="task-detail__comment-avatar" />
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="کامنت بنویس…"
            />
          </form>
        </div>

        {canDelete && (
          <button className="task-detail__delete" onClick={() => onDelete(task.id)}>
            حذف تسک
          </button>
        )}
      </aside>
    {showDatePicker && (
      <DatePickerModal
        value={dueDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={(dateStr) => {
          setDueDate(dateStr);
          persist({ dueDate: dateStr });
        }}
      />
    )}
    </div>
  );
}
