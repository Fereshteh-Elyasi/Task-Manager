import { useMemo, useState } from "react";
import {
  buildMonthGrid,
  monthNames,
  weekdayLabels,
  getTodayJalaliStr,
  pad2,
} from "../utils/jalaliCalendar";
import "./DatePickerModal.css";

function parseJalali(str) {
  if (!str) return null;
  const parts = String(str).replace(/-/g, "/").split("/").map(Number);
  if (parts.length !== 3 || parts.some((n) => !n && n !== 0)) return null;
  return { jy: parts[0], jm: parts[1], jd: parts[2] };
}

export default function DatePickerModal({ value, onSelect, onClose }) {
  const TODAY = useMemo(() => getTodayJalaliStr(), []);
  const initial = parseJalali(value) || parseJalali(TODAY) || { jy: 1404, jm: 1, jd: 1 };

  const [jy, setJy] = useState(initial.jy);
  const [jm, setJm] = useState(initial.jm);

  const cells = useMemo(() => buildMonthGrid(jy, jm, TODAY), [jy, jm, TODAY]);
  const selected = value ? String(value).replace(/-/g, "/") : "";

  function goPrev() {
    if (jm === 1) {
      setJm(12);
      setJy((y) => y - 1);
    } else setJm((m) => m - 1);
  }

  function goNext() {
    if (jm === 12) {
      setJm(1);
      setJy((y) => y + 1);
    } else setJm((m) => m + 1);
  }

  function pick(cell) {
    if (!cell.inMonth) {
      setJy(cell.jy);
      setJm(cell.jm);
      return;
    }
    const dateStr = `${cell.jy}/${pad2(cell.jm)}/${pad2(cell.jd)}`;
    onSelect?.(dateStr);
    onClose?.();
  }

  function clearDate(e) {
    e.stopPropagation();
    onSelect?.("");
    onClose?.();
  }

  return (
    <div className="dp-modal__backdrop" onClick={onClose} role="presentation">
      <div
        className="dp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="انتخاب تاریخ"
      >
        <div className="dp-modal__header">
          <h3>انتخاب سررسید</h3>
          <button type="button" className="dp-modal__close" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </div>

        <div className="dp-modal__nav">
          <button type="button" onClick={goNext} aria-label="ماه بعد">
            ‹
          </button>
          <span>
            {monthNames[jm - 1]} {jy}
          </span>
          <button type="button" onClick={goPrev} aria-label="ماه قبل">
            ›
          </button>
        </div>

        <div className="dp-modal__weekdays">
          {weekdayLabels.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="dp-modal__grid">
          {cells.map((cell) => {
            const dateStr = cell.dateStr;
            const isSelected = selected && normalize(selected) === dateStr;
            return (
              <button
                key={dateStr + (cell.inMonth ? "i" : "o")}
                type="button"
                className={
                  "dp-modal__cell" +
                  (!cell.inMonth ? " is-outside" : "") +
                  (cell.isToday ? " is-today" : "") +
                  (isSelected ? " is-selected" : "")
                }
                onClick={() => pick(cell)}
              >
                {cell.jd}
              </button>
            );
          })}
        </div>

        <div className="dp-modal__footer">
          <button type="button" className="dp-modal__today" onClick={() => {
            onSelect?.(TODAY);
            onClose?.();
          }}>
            امروز ({TODAY})
          </button>
          <button type="button" className="dp-modal__clear" onClick={clearDate}>
            پاک کردن تاریخ
          </button>
        </div>
      </div>
    </div>
  );
}

function normalize(s) {
  const parts = String(s).replace(/-/g, "/").split("/");
  if (parts.length !== 3) return s;
  return `${parts[0]}/${String(Number(parts[1])).padStart(2, "0")}/${String(Number(parts[2])).padStart(2, "0")}`;
}
