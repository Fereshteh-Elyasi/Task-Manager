import { priorities, labels } from "../data/mockData";
import { useAuth } from "../auth/AuthContext";
import "./ListView.css";

export default function ListView({ board, tasks, matches, onOpenTask }) {
  const { users } = useAuth();

  return (
    <div className="list-view">
      {board.columns.map((col) => {
        const colTasks = col.taskIds
          .map((id) => tasks[id])
          .filter(Boolean)
          .filter(matches);
        if (colTasks.length === 0) return null;

        return (
          <section key={col.id} className="list-view__group">
            <p className="list-view__group-title">
              {col.title} <span>{colTasks.length}</span>
            </p>
            <div className="list-view__table">
              {colTasks.map((task) => {
                const priority = priorities[task.priority];
                const assignee = task.assigneeId ? users[task.assigneeId] : null;
                const taskLabels = (task.labelIds || []).map((id) => labels[id]).filter(Boolean);
                return (
                  <button
                    key={task.id}
                    type="button"
                    className="list-view__row"
                    onClick={() => onOpenTask(task.id)}
                  >
                    <span
                      className="list-view__priority"
                      style={{ background: priority.color }}
                      title={priority.label}
                    />
                    <span className="list-view__title">{task.title}</span>
                    <span className="list-view__labels">
                      {taskLabels.map((l) => (
                        <span
                          key={l.id}
                          className="list-view__label"
                          style={{ background: l.color + "1c", color: l.color }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </span>
                    {task.dueDate && <span className="list-view__due">{task.dueDate}</span>}
                    {assignee ? (
                      <span
                        className="list-view__avatar"
                        style={{ background: assignee.color }}
                        title={assignee.name}
                      >
                        {assignee.name[0]}
                      </span>
                    ) : (
                      <span className="list-view__avatar list-view__avatar--empty" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
