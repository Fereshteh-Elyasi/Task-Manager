import { priorities, labels as defaultLabels } from "../data/mockData";
import "./ReportsPage.css";

function Bar({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="reports-page__bar-row">
      <span className="reports-page__bar-label">{label}</span>
      <div className="reports-page__bar-track">
        <div className="reports-page__bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="reports-page__bar-count">{count}</span>
    </div>
  );
}

export default function ReportsPage({ board, tasks, users , labels: labelsProp }) {
  const labels = labelsProp || defaultLabels;
  const allTasks = Object.values(tasks);
  const total = allTasks.length;

  const byColumn = board.columns.map((c) => ({ label: c.title, count: c.taskIds.length }));

  const byPriority = Object.entries(priorities).map(([key, p]) => ({
    label: p.label,
    color: p.color,
    count: allTasks.filter((t) => t.priority === key).length,
  }));

  const byAssignee = Object.values(users)
    .map((u) => ({
      user: u,
      count: allTasks.filter((t) => t.assigneeId === u.id).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  const byLabel = Object.values(labels)
    .map((l) => ({
      label: l.name,
      color: l.color,
      count: allTasks.filter((t) => (t.labelIds || []).includes(l.id)).length,
    }))
    .filter((row) => row.count > 0);

  const totalChecklist = allTasks.reduce((sum, t) => sum + (t.checklist || []).length, 0);
  const doneChecklist = allTasks.reduce(
    (sum, t) => sum + (t.checklist || []).filter((c) => c.done).length,
    0
  );
  const checklistPct = totalChecklist ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

  return (
    <div className="reports-page">
      <h1 className="reports-page__title">گزارش‌ها</h1>

      {total === 0 ? (
        <p className="reports-page__empty">هنوز تسکی برای گزارش‌گیری وجود ندارد.</p>
      ) : (
        <div className="reports-page__grid">
          <section className="reports-page__panel">
            <h2>وضعیت تسک‌ها</h2>
            {byColumn.map((row) => (
              <Bar key={row.label} label={row.label} count={row.count} total={total} color="var(--violet)" />
            ))}
          </section>

          <section className="reports-page__panel">
            <h2>اولویت‌ها</h2>
            {byPriority.map((row) => (
              <Bar key={row.label} label={row.label} count={row.count} total={total} color={row.color} />
            ))}
          </section>

          {byAssignee.length > 0 && (
            <section className="reports-page__panel">
              <h2>تسک به تفکیک عضو</h2>
              {byAssignee.map((row) => (
                <div key={row.user.id} className="reports-page__assignee-row">
                  <span className="reports-page__avatar" style={{ background: row.user.color }}>
                    {row.user.name[0]}
                  </span>
                  <span className="reports-page__assignee-name">{row.user.name}</span>
                  <span className="reports-page__assignee-count">{row.count}</span>
                </div>
              ))}
            </section>
          )}

          {byLabel.length > 0 && (
            <section className="reports-page__panel">
              <h2>برچسب‌ها</h2>
              {byLabel.map((row) => (
                <Bar key={row.label} label={row.label} count={row.count} total={total} color={row.color} />
              ))}
            </section>
          )}

          <section className="reports-page__panel">
            <h2>پیشرفت چک‌لیست‌ها</h2>
            <div className="reports-page__ring-wrap">
              <div
                className="reports-page__ring"
                style={{
                  background: `conic-gradient(var(--sage) ${checklistPct * 3.6}deg, var(--border) 0deg)`,
                }}
              >
                <span>{checklistPct}٪</span>
              </div>
              <p>
                {doneChecklist} از {totalChecklist} مورد چک‌لیست انجام شده
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
