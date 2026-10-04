// Shape mirrors what the PHP API will eventually return.
// GET /api/boards/:id → { id, title, columns: [{ id, title, taskIds }] }
// GET /api/tasks?board=:id → { [taskId]: {...} }
// Keeping this shape stable means swapping these constants for real
// fetch() calls later requires no changes to the components below.

// Fixed "today" for the demo data — overdue calculations and the
// calendar view compare against this. Format is Jalali "YYYY/MM/DD".
export const TODAY = "1404/06/12";

export const priorities = {
  low: { label: "کم", color: "var(--sage)" },
  medium: { label: "متوسط", color: "var(--amber)" },
  high: { label: "زیاد", color: "var(--coral)" },
};

// Seed accounts — in the real backend these become rows in a `users`
// table with a hashed password; role is enforced server-side too,
// not just hidden in the UI.
export const seedMembers = {
  "u-1": {
    id: "u-1",
    name: "سارا احمدی",
    email: "sara@taskline.dev",
    password: "1234",
    color: "#6C4CF1",
    role: "admin",
  },
  "u-2": {
    id: "u-2",
    name: "رضا کریمی",
    email: "reza@taskline.dev",
    password: "1234",
    color: "#2FAE7C",
    role: "member",
  },
  "u-3": {
    id: "u-3",
    name: "نگار محمدی",
    email: "negar@taskline.dev",
    password: "1234",
    color: "#FF6B4A",
    role: "member",
  },
  "u-4": {
    id: "u-4",
    name: "امیر رستمی",
    email: "amir@taskline.dev",
    password: "1234",
    color: "#E0A419",
    role: "guest",
  },
};

export const roleLabels = {
  admin: "مدیر",
  member: "عضو",
  guest: "مهمان",
};

export const labels = {
  "l-1": { id: "l-1", name: "بک‌اند", color: "#6C4CF1" },
  "l-2": { id: "l-2", name: "فرانت‌اند", color: "#2FAE7C" },
  "l-3": { id: "l-3", name: "طراحی", color: "#FF6B4A" },
  "l-4": { id: "l-4", name: "فوری", color: "#E0A419" },
};

export const projectIcons = ["diamond", "diamondOutline", "hex", "triangle", "circle", "square", "star", "half"];

export const projects = [
  { id: "p-1", name: "تسک‌منیجر تیم محصول", icon: "diamond" },
  { id: "p-2", name: "کمپین بازاریابی بهار", icon: "diamondOutline" },
  { id: "p-3", name: "ری‌دیزاین اپ موبایل", icon: "hex" },
];

const defaultColumnTitles = ["برای انجام", "در حال انجام", "بازبینی", "انجام‌شده"];

export function createEmptyBoard(id, title) {
  return {
    id,
    title,
    columns: defaultColumnTitles.map((t, i) => ({
      id: `col-${i + 1}`,
      title: t,
      taskIds: [],
    })),
  };
}

export const mockBoard = {
  id: 1,
  title: "تسک‌منیجر تیم محصول",
  columns: [
    { id: "col-1", title: "برای انجام", taskIds: ["t-1", "t-2", "t-3"] },
    { id: "col-2", title: "در حال انجام", taskIds: ["t-4", "t-6"] },
    { id: "col-3", title: "بازبینی", taskIds: ["t-7"] },
    { id: "col-4", title: "انجام‌شده", taskIds: ["t-5"] },
  ],
};

export const mockTasks = {
  "t-1": {
    id: "t-1",
    title: "طراحی دیتابیس",
    description: "جدول‌های boards, columns, tasks, users را طراحی و نرمال‌سازی کن.",
    priority: "high",
    labelIds: ["l-1"],
    assigneeId: "u-2",
    dueDate: "1404/06/10",
    checklist: [
      { id: "c-1", text: "طراحی ERD", done: true },
      { id: "c-2", text: "نوشتن migration ها", done: false },
    ],
    attachments: [],
    comments: [
      {
        id: "cm-1",
        authorId: "u-1",
        text: "لطفاً رابطه‌ی many-to-many بین تسک‌ها و لیبل‌ها رو هم لحاظ کن.",
        time: "دیروز، ۱۴:۲۰",
      },
    ],
  },
  "t-2": {
    id: "t-2",
    title: "ساخت اسکلت React",
    description: "کامپوننت‌های Board, Column, TaskCard",
    priority: "medium",
    labelIds: ["l-2"],
    assigneeId: "u-1",
    dueDate: "1404/06/05",
    checklist: [{ id: "c-3", text: "راه‌اندازی Vite", done: true }],
    attachments: [],
    comments: [],
  },
  "t-3": {
    id: "t-3",
    title: "افزودن Drag & Drop",
    description: "بین ستون‌ها با dnd-kit",
    priority: "medium",
    labelIds: ["l-2"],
    assigneeId: "u-1",
    dueDate: "",
    checklist: [],
    attachments: [],
    comments: [],
  },
  "t-4": {
    id: "t-4",
    title: "نوشتن API با PHP خام",
    description: "اندپوینت‌های CRUD برای تسک‌ها و ستون‌ها",
    priority: "high",
    labelIds: ["l-1", "l-4"],
    assigneeId: "u-2",
    dueDate: "1404/06/14",
    checklist: [
      { id: "c-4", text: "اندپوینت GET /boards", done: true },
      { id: "c-5", text: "اندپوینت POST /tasks", done: true },
      { id: "c-6", text: "اندپوینت PATCH /tasks/:id", done: false },
      { id: "c-7", text: "احراز هویت JWT", done: false },
    ],
    attachments: [],
    comments: [
      { id: "cm-2", authorId: "u-2", text: "اندپوینت GET و POST آماده شد، در حال تست PATCH هستم.", time: "امروز، ۰۹:۱۰" },
      { id: "cm-3", authorId: "u-1", text: "عالی، برای JWT از firebase/php-jwt استفاده کن.", time: "امروز، ۰۹:۴۵" },
    ],
  },
  "t-5": {
    id: "t-5",
    title: "راه‌اندازی پروژه",
    description: "Vite + npm install",
    priority: "low",
    labelIds: [],
    assigneeId: "u-3",
    dueDate: "1404/05/28",
    checklist: [{ id: "c-8", text: "نصب وابستگی‌ها", done: true }],
    attachments: [],
    comments: [],
  },
  "t-6": {
    id: "t-6",
    title: "طراحی رابط کاربری کارت‌ها",
    description: "افزودن آواتار، لیبل و نوار پیشرفت چک‌لیست",
    priority: "medium",
    labelIds: ["l-3"],
    assigneeId: "u-4",
    dueDate: "1404/06/08",
    checklist: [
      { id: "c-9", text: "طراحی در فیگما", done: true },
      { id: "c-10", text: "پیاده‌سازی CSS", done: false },
    ],
    attachments: [],
    comments: [],
  },
  "t-7": {
    id: "t-7",
    title: "بازبینی امنیتی API",
    description: "بررسی SQL Injection و اعتبارسنجی ورودی‌ها",
    priority: "high",
    labelIds: ["l-1", "l-4"],
    assigneeId: "u-2",
    dueDate: "1404/06/12",
    checklist: [],
    attachments: [],
    comments: [],
  },
};

export const projectBoards = {
  "p-1": { board: mockBoard, tasks: mockTasks },
  "p-2": { board: createEmptyBoard(2, "کمپین بازاریابی بهار"), tasks: {} },
  "p-3": { board: createEmptyBoard(3, "ری‌دیزاین اپ موبایل"), tasks: {} },
};
