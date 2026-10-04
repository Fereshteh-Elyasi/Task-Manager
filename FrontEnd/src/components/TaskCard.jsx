import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { priorities, labels as defaultLabels } from "../data/mockData";
import { useAuth } from "../auth/AuthContext";
import Avatar from "./Avatar";
import { IconCalendar, IconChat, IconPaperclip } from "./Icons";
import "./TaskCard.css";

export default function TaskCard({ task, onOpen, labelsMap }) {
  const { users, currentUser } = useAuth();
  const canDrag = currentUser?.role !== "guest";
  const pointerStart = useRef(null);
  const didDrag = useRef(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "task" }, disabled: !canDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: canDrag ? "grab" : "pointer",
  };

  const priority = priorities[task.priority] || priorities.medium;
  const assignee = task.assigneeId ? users[task.assigneeId] : null;
  const labels = labelsMap || defaultLabels;
  const taskLabels = (task.labelIds || []).map((id) => labels[id]).filter(Boolean);
  const checklist = task.checklist || [];
  const doneCount = checklist.filter((c) => c.done).length;
  const commentCount = (task.comments || []).length;
  const attachmentCount = (task.attachments || []).length;

  // listeners را خراب نکن — فقط قبل/بعدش منطق کلیک را اضافه کن
  const dndListeners = canDrag ? listeners : {};

  function handlePointerDown(e) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    didDrag.current = false;
    dndListeners.onPointerDown?.(e);
  }

  function handlePointerMove(e) {
    if (!pointerStart.current) return;
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    if (dx > 6 || dy > 6) didDrag.current = true;
    dndListeners.onPointerMove?.(e);
  }

  function handlePointerUp(e) {
    dndListeners.onPointerUp?.(e);
    if (!didDrag.current && pointerStart.current) {
      onOpen?.(task.id);
    }
    pointerStart.current = null;
  }

  // بقیهٔ listenerها (غیر از pointer) را مستقیم پاس بده
  const restListeners = { ...dndListeners };
  delete restListeners.onPointerDown;
  delete restListeners.onPointerMove;
  delete restListeners.onPointerUp;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      {...attributes}
      {...restListeners}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(task.id);
        }
      }}
    >
      <span
        className="task-card__priority"
        style={{ background: priority.color }}
        aria-hidden="true"
      />
      <div className="task-card__body">
        {taskLabels.length > 0 && (
          <div className="task-card__labels">
            {taskLabels.map((l) => (
              <span
                key={l.id}
                className="task-card__label"
                style={{ background: l.color + "1c", color: l.color }}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        <p className="task-card__title">{task.title}</p>

        {checklist.length > 0 && (
          <div className="task-card__checklist">
            <div className="task-card__progress-track">
              <div
                className="task-card__progress-fill"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <span className="task-card__progress-label">
              {doneCount}/{checklist.length}
            </span>
          </div>
        )}

        <div className="task-card__footer">
          <div className="task-card__footer-left">
            {task.dueDate && <span className="task-card__due"><IconCalendar s={13} /> {task.dueDate}</span>}
            <span className="task-card__priority-label" style={{ color: priority.color }}>
              {priority.label}
            </span>
            {commentCount > 0 && (
              <span className="task-card__meta-icon"><IconChat s={13} /> {commentCount}</span>
            )}
            {attachmentCount > 0 && (
              <span className="task-card__meta-icon"><IconPaperclip s={13} /> {attachmentCount}</span>
            )}
          </div>
          {assignee && <Avatar user={assignee} size={22} className="task-card__avatar" />}
        </div>
      </div>
    </div>
  );
}
