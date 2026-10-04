import { useState } from "react";
import { priorities } from "../data/mockData";
import { buildMonthGrid, monthNames, weekdayLabels, getTodayJalaliStr, isOverdue } from "../utils/jalaliCalendar";
import "./CalendarPage.css";

export default function CalendarPage({ tasks, onOpenTask }) {
  const TODAY = getTodayJalaliStr();
  const [todayY, todayM] = TODAY.split("/").map(Number);
  const [jy, setJy] = useState(todayY);
  const [jm, setJm] = useState(todayM);
  const [selectedDate, setSelectedDate] = useState(null);

  const cells = buildMonthGrid(jy, jm, TODAY);

  function normalizeDate(s) {
    if (!s) return "";
    const parts = String(s).replace(/-/g, "/").split("/");
    if (parts.length !== 3) return s;
    const [y, m, d] = parts;
    return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
  }

  const taskList = Array.isArray(tasks) ? tasks : Object.values(tasks || {});
  const tasksByDate = {};
  taskList.forEach((t) => {
    if (!t.dueDate) return;
    const key = normalizeDate(t.dueDate);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  function goPrev() {
    if (jm === 1) {
      setJm(12);
      setJy((y) => y - 1);
    } else {
      setJm((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function goNext() {
    if (jm === 12) {
      setJm(1);
      setJy((y) => y + 1);
    } else {
      setJm((m) => m + 1);
    }
    setSelectedDate(null);
  }

  function goToday() {
    setJy(todayY);
    setJm(todayM);
    setSelectedDate(null);
  }

  const selectedTasks = selectedDate ? tasksByDate[selectedDate] || [] : [];

  return (
    <div className="calendar-page">
      <div className="calendar-page__header">
        <h1 className="calendar-page__title">تقویم</h1>
        <div className="calendar-page__nav">
          <button type="button" onClick={goToday} className="calendar-page__today-btn">
            امروز
          </button>
          <button type="button" onClick={goNext} className="calendar-page__arrow" aria-label="ماه بعد">
            ‹
          </button>
          <span className="calendar-page__month-label">
            {monthNames[jm - 1]} {jy}
          </span>
          <button type="button" onClick={goPrev} className="calendar-page__arrow" aria-label="ماه قبل">
            ›
          </button>
        </div>
      </div>

      <div className="calendar-page__layout">
        <div className="calendar-page__grid-wrap">
          <div className="calendar-page__weekdays">
            {weekdayLabels.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="calendar-page__grid">
            {cells.map((cell) => {
              const dayTasks = tasksByDate[cell.dateStr] || [];
              const shown = dayTasks.slice(0, 3);
              const overflow = dayTasks.length - shown.length;
              const cellOverdue = cell.inMonth && dayTasks.length > 0 && isOverdue(cell.dateStr);
              return (
                <button
                  type="button"
                  key={cell.dateStr + cell.inMonth}
                  className={
                    "calendar-page__cell" +
                    (!cell.inMonth ? " is-outside" : "") +
                    (cell.isToday ? " is-today" : "") +
                    (cellOverdue ? " is-overdue" : "") +
                    (selectedDate === cell.dateStr ? " is-selected" : "")
                  }
                  onClick={() => setSelectedDate(cell.dateStr)}
                >
                  <span className="calendar-page__cell-day">{cell.jd}</span>
                  <span className="calendar-page__cell-tasks">
                    {shown.map((t) => (
                      <span
                        key={t.id}
                        className="calendar-page__chip"
                        style={{
                          background: priorities[t.priority].color + "1c",
                          color: priorities[t.priority].color,
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </span>
                    ))}
                    {overflow > 0 && (
                      <span className="calendar-page__more">+{overflow} بیشتر</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="calendar-page__side">
          <h2>{selectedDate ? selectedDate : "روزی را انتخاب کن"}</h2>
          {!selectedDate && (
            <p className="calendar-page__side-empty">
              برای دیدن تسک‌های هر روز، روی آن کلیک کن.
            </p>
          )}
          {selectedDate && selectedTasks.length === 0 && (
            <p className="calendar-page__side-empty">تسکی در این روز سررسید ندارد.</p>
          )}
          {selectedTasks.map((t) => (
            <button
              key={t.id}
              type="button"
              className="calendar-page__side-task"
              onClick={() => onOpenTask(t)}
            >
              <span
                className="calendar-page__side-dot"
                style={{ background: priorities[t.priority].color }}
              />
              <span>{t.title}</span>
              {isOverdue(t.dueDate) && (
                <span className="calendar-page__overdue-badge">منقضی شده</span>
              )}
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}
