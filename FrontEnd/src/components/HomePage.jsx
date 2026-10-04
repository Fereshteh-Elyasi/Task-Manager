import { priorities } from "../data/mockData";
import "./HomePage.css";

export default function HomePage({ board, tasks, currentUser, onOpenTask, onGoToBoards }) {
  const allTasks = Object.values(tasks);
  const total = allTasks.length;

  const columnCounts = board.columns.map((c) => ({
    title: c.title,
    count: c.taskIds.length,
  }));

  const doneColumn = board.columns[board.columns.length - 1];
  const doneCount = doneColumn ? doneColumn.taskIds.length : 0;
  const progressPct = total ? Math.round((doneCount / total) * 100) : 0;

  const myTasks = allTasks.filter((t) => t.assigneeId === currentUser.id);

  const upcoming = allTasks
    .filter((t) => t.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="home-page">
      <div className="home-page__greeting">
        <h1>
          سلام {currentUser.name.split(" ")[0]}
        </h1>
        <p>خلاصه‌ای از وضعیت پروژه‌ی «{board.title}»</p>
      </div>

      <div className="home-page__stats">
        <div className="home-page__stat-card">
          <span className="home-page__stat-number">{total}</span>
          <span className="home-page__stat-label">کل تسک‌ها</span>
        </div>
        <div className="home-page__stat-card">
          <span className="home-page__stat-number">{myTasks.length}</span>
          <span className="home-page__stat-label">تسک‌های من</span>
        </div>
        <div className="home-page__stat-card">
          <span className="home-page__stat-number">{progressPct}٪</span>
          <span className="home-page__stat-label">پیشرفت کلی</span>
        </div>
      </div>

      <div className="home-page__columns">
        {columnCounts.map((c) => (
          <div key={c.title} className="home-page__column-chip">
            <span>{c.title}</span>
            <b>{c.count}</b>
          </div>
        ))}
      </div>

      <div className="home-page__grid">
        <section className="home-page__panel">
          <div className="home-page__panel-head">
            <h2>تسک‌های من</h2>
            <button type="button" onClick={onGoToBoards} className="home-page__link">
              رفتن به بورد ←
            </button>
          </div>
          {myTasks.length === 0 && <p className="home-page__empty">تسکی به شما محول نشده.</p>}
          <ul className="home-page__task-list">
            {myTasks.slice(0, 6).map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => onOpenTask(t)}>
                  <span
                    className="home-page__dot"
                    style={{ background: priorities[t.priority].color }}
                  />
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="home-page__panel">
          <div className="home-page__panel-head">
            <h2>نزدیک‌ترین سررسیدها</h2>
          </div>
          {upcoming.length === 0 && <p className="home-page__empty">سررسیدی ثبت نشده.</p>}
          <ul className="home-page__task-list">
            {upcoming.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => onOpenTask(t)}>
                  <span className="home-page__due">{t.dueDate}</span>
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
