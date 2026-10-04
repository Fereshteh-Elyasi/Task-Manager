import "./InboxPage.css";
import { IconFolder } from "./Icons";
import { getTodayJalaliStr } from "../utils/jalaliCalendar";

export default function InboxPage({ tasks, users, currentUser, onOpenTask }) {
  const allTasks = Array.isArray(tasks) ? tasks : Object.values(tasks || {});

  const assignedToMe = allTasks.filter(
    (t) => t.assigneeId && t.assigneeId === currentUser.id
  );

  const today = getTodayJalaliStr();
  const dueSoon = allTasks.filter((t) => {
    if (!t.dueDate || !t.assigneeId) return false;
    if (t.assigneeId !== currentUser.id) return false;
    // سررسید امروز یا گذشته (نسبت رشته جلالی YYYY/MM/DD)
    const d = String(t.dueDate).replace(/-/g, "/");
    return d <= today;
  });

  const commentItems = [];
  allTasks.forEach((t) => {
    (t.comments || []).forEach((c) => {
      if (c.authorId && c.authorId !== currentUser.id) {
        commentItems.push({ task: t, comment: c });
      }
    });
  });
  // تازه‌ترین‌ها بالا
  commentItems.sort((a, b) =>
    String(b.comment.createdAt || "").localeCompare(String(a.comment.createdAt || ""))
  );

  const isEmpty =
    assignedToMe.length === 0 && commentItems.length === 0 && dueSoon.length === 0;

  return (
    <div className="inbox-page">
      <h1 className="inbox-page__title">صندوق ورودی</h1>

      {isEmpty && <p className="inbox-page__empty">فعلاً خبری نیست.</p>}

      {dueSoon.length > 0 && (
        <section className="inbox-page__section">
          <p className="inbox-page__section-title">سررسید نزدیک / گذشته</p>
          {dueSoon.map((t) => (
            <button
              key={"due-" + t.id}
              type="button"
              className="inbox-page__item"
              onClick={() => onOpenTask(t)}
            >
              <span className="inbox-page__icon">
                <IconFolder s={16} />
              </span>
              <span className="inbox-page__item-text">
                سررسید «<b>{t.title}</b>»: {t.dueDate}
              </span>
            </button>
          ))}
        </section>
      )}

      {assignedToMe.length > 0 && (
        <section className="inbox-page__section">
          <p className="inbox-page__section-title">تسک‌های محول‌شده به شما</p>
          {assignedToMe.map((t) => (
            <button
              key={t.id}
              type="button"
              className="inbox-page__item"
              onClick={() => onOpenTask(t)}
            >
              <span className="inbox-page__icon">
                <IconFolder s={16} />
              </span>
              <span className="inbox-page__item-text">
                یک تسک به شما محول شد: <b>{t.title}</b>
                {t.dueDate ? ` — سررسید ${t.dueDate}` : ""}
              </span>
            </button>
          ))}
        </section>
      )}

      {commentItems.length > 0 && (
        <section className="inbox-page__section">
          <p className="inbox-page__section-title">کامنت‌های تازه</p>
          {commentItems.map(({ task, comment }) => {
            const author = users[comment.authorId];
            return (
              <button
                key={comment.id}
                type="button"
                className="inbox-page__item"
                onClick={() => onOpenTask(task)}
              >
                <span
                  className="inbox-page__avatar"
                  style={{ background: author?.color || "var(--ink-faint)" }}
                >
                  {author?.name?.[0] || "?"}
                </span>
                <span className="inbox-page__item-text">
                  <b>{author?.name || "کاربر"}</b> روی «{task.title}» کامنت گذاشت: {comment.text}
                </span>
              </button>
            );
          })}
        </section>
      )}
    </div>
  );
}
