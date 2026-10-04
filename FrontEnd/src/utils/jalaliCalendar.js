import { toGregorian, toJalaali, jalaaliMonthLength } from "jalaali-js";

export const monthNames = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

// Persian week starts on Saturday. JS getDay(): 0=Sun..6=Sat.
// Map JS weekday -> column index where Saturday is column 0.
const weekdayLabels = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
export { weekdayLabels };

function jsWeekdayToRtlColumn(jsDay) {
  // jsDay: 0=Sun,1=Mon,...,6=Sat  →  column: Sat=0,Sun=1,...,Fri=6
  return (jsDay + 1) % 7;
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

// Builds a 6x7 grid (42 cells) for the given Jalali year/month (1-12).
// Each cell: { jy, jm, jd, inMonth, dateStr, isToday }
export function buildMonthGrid(jy, jm, todayStr) {
  const daysInMonth = jalaaliMonthLength(jy, jm);
  const firstGregorian = toGregorian(jy, jm, 1);
  const firstJsDate = new Date(firstGregorian.gy, firstGregorian.gm - 1, firstGregorian.gd);
  const firstColumn = jsWeekdayToRtlColumn(firstJsDate.getDay());

  const cells = [];

  // Leading days from previous month
  const prevMonth = jm === 1 ? 12 : jm - 1;
  const prevYear = jm === 1 ? jy - 1 : jy;
  const prevMonthLength = jalaaliMonthLength(prevYear, prevMonth);
  for (let i = 0; i < firstColumn; i++) {
    const d = prevMonthLength - firstColumn + i + 1;
    cells.push({
      jy: prevYear,
      jm: prevMonth,
      jd: d,
      inMonth: false,
      dateStr: `${prevYear}/${pad2(prevMonth)}/${pad2(d)}`,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${jy}/${pad2(jm)}/${pad2(d)}`;
    cells.push({ jy, jm, jd: d, inMonth: true, dateStr, isToday: dateStr === todayStr });
  }

  // Trailing days from next month to complete the grid (multiple of 7)
  const nextMonth = jm === 12 ? 1 : jm + 1;
  const nextYear = jm === 12 ? jy + 1 : jy;
  let nd = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({
      jy: nextYear,
      jm: nextMonth,
      jd: nd,
      inMonth: false,
      dateStr: `${nextYear}/${pad2(nextMonth)}/${pad2(nd)}`,
    });
    nd++;
    if (cells.length >= 42) break;
  }

  return cells;
}


/** تاریخ امروز به صورت رشته جلالی YYYY/MM/DD */
export function getTodayJalaliStr() {
  const now = new Date();
  const j = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${j.jy}/${pad2(j.jm)}/${pad2(j.jd)}`;
}

/** آیا تاریخ سررسید گذشته (قبل از امروز) است؟ ورودی هر شکلی (- یا /) قبول می‌شود */
export function isOverdue(dueDateStr) {
  if (!dueDateStr) return false;
  const normalized = String(dueDateStr).replace(/-/g, "/").trim();
  if (!normalized) return false;
  return normalized < getTodayJalaliStr();
}

