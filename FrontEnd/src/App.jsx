import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Board from "./components/Board";
import Login from "./components/Login";
import TaskDetail from "./components/TaskDetail";
import ProjectModal from "./components/ProjectModal";
import InviteModal from "./components/InviteModal";
import ProfileModal from "./components/ProfileModal";
import HomePage from "./components/HomePage";
import InboxPage from "./components/InboxPage";
import CalendarPage from "./components/CalendarPage";
import ReportsPage from "./components/ReportsPage";
import UserManagementPage from "./components/UserManagementPage";
import ProfileDetailModal from "./components/ProfileDetailModal";
import { useAuth } from "./auth/AuthContext";
import { createEmptyBoard, labels as fallbackLabels } from "./data/mockData";
import { getTodayJalaliStr } from "./utils/jalaliCalendar";
import api from "./api/client";
import "./styles/index.css";
import "./App.css";

export default function App() {
  const { currentUser, users, inviteMember, updateUserRole } = useAuth();

  const [projectsList, setProjectsList] = useState([]);
  const [boardsData, setBoardsData] = useState({});
  const [projectLabels, setProjectLabels] = useState({});
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [bootError, setBootError] = useState("");

  const [page, setPage] = useState("boards");
  const [view, setView] = useState("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [openTask, setOpenTask] = useState(null);
  // کارت‌ها گاهی آبجکت می‌فرستند؛ همیشه id نگه می‌داریم
  const openTaskPanel = (taskOrId) => {
    if (!taskOrId) {
      setOpenTask(null);
      return;
    }
    setOpenTask(typeof taskOrId === "string" ? taskOrId : taskOrId.id);
  };

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTargetProjectId, setInviteTargetProjectId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [inboxVisited, setInboxVisited] = useState(false);
  const [projectMembers, setProjectMembers] = useState({});
  const [profileDetailId, setProfileDetailId] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      const list = await api.listProjects();
      setProjectsList(Array.isArray(list) ? list : []);
      setBootError("");
      return list;
    } catch (e) {
      setBootError(e.message || "خطا در دریافت پروژه‌ها");
      return [];
    }
  }, []);

  const loadBoard = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoadingBoard(true);
    try {
      const data = await api.getBoard(projectId);
      setBoardsData((prev) => ({
        ...prev,
        [projectId]: {
          board: data.board,
          tasks: data.tasks || {},
        },
      }));
      try {
        const labs = await api.listLabels(projectId);
        const map = {};
        (Array.isArray(labs) ? labs : []).forEach((l) => {
          map[l.id] = l;
        });
        setProjectLabels((prev) => ({ ...prev, [projectId]: map }));
      } catch {
        /* labels optional */
      }
    } catch (e) {
      console.error(e);
      setBootError(e.message || "خطا در بارگذاری برد");
    } finally {
      setLoadingBoard(false);
    }
  }, []);


  const loadProjectMembers = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const list = await api.listProjectMembers(projectId);
      const map = {};
      (Array.isArray(list) ? list : []).forEach((m) => {
        map[m.id] = m;
      });
      setProjectMembers((prev) => ({ ...prev, [projectId]: map }));
    } catch (e) {
      console.error("load members", projectId, e);
    }
  }, []);

  const loadAllBoards = useCallback(async (list) => {
    const projects = list || projectsList;
    if (!projects?.length) return;
    await Promise.all(
      projects.map(async (proj) => {
        const projectId = proj.id;
        try {
          const data = await api.getBoard(projectId);
          setBoardsData((prev) => ({
            ...prev,
            [projectId]: {
              board: data.board,
              tasks: data.tasks || {},
            },
          }));
          if (Array.isArray(data.labels) && data.labels.length) {
            const map = {};
            data.labels.forEach((l) => {
              map[l.id] = l;
            });
            setProjectLabels((prev) => ({ ...prev, [projectId]: map }));
          }
        } catch (e) {
          console.error("load board", projectId, e);
        }
      })
    );
  }, [projectsList]);

  // بعد از لاگین، پروژه‌ها را بگیر
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      const list = await loadProjects();
      if (cancelled) return;
      if (list.length > 0) {
        setActiveProjectId((prev) => prev || list[0].id);
        // همه بردها را برای تقویم و صندوق بارگذاری کن
        await loadAllBoards(list);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser, loadProjects, loadAllBoards]);

  // وقتی پروژه فعال عوض شد، برد را بگیر
  useEffect(() => {
    if (!currentUser || !activeProjectId) return;
    if (boardsData[activeProjectId]) return; // قبلاً لود شده
    loadBoard(activeProjectId);
  }, [currentUser, activeProjectId, boardsData, loadBoard]);

  // اعضای پروژه فعال را برای نوار بالا و لیست مسئول‌ها بگیر
  useEffect(() => {
    if (!currentUser || !activeProjectId) return;
    if (projectMembers[activeProjectId]) return;
    loadProjectMembers(activeProjectId);
  }, [currentUser, activeProjectId, projectMembers, loadProjectMembers]);

  if (!currentUser) {
    return <Login />;
  }

  const isActiveProjectMember =
    !projectMembers[activeProjectId] ||
    currentUser.role === "admin" ||
    Boolean(projectMembers[activeProjectId]?.[currentUser.id]);
  const canCreate = currentUser.role !== "guest" && isActiveProjectMember;
  const activeEntry =
    boardsData[activeProjectId] || {
      board: createEmptyBoard(activeProjectId || "0", "…"),
      tasks: {},
    };
  const { board, tasks } = activeEntry;
  const labelsMap = projectLabels[activeProjectId] || fallbackLabels;

  function setBoard(updater) {
    setBoardsData((prev) => {
      const entry = prev[activeProjectId] || { board: createEmptyBoard(0, ""), tasks: {} };
      const nextBoard = typeof updater === "function" ? updater(entry.board) : updater;
      return { ...prev, [activeProjectId]: { ...entry, board: nextBoard } };
    });
  }

  function setTasks(updater) {
    setBoardsData((prev) => {
      const entry = prev[activeProjectId] || { board: createEmptyBoard(0, ""), tasks: {} };
      const nextTasks = typeof updater === "function" ? updater(entry.tasks) : updater;
      return { ...prev, [activeProjectId]: { ...entry, tasks: nextTasks } };
    });
  }

  async function handleCreateLabel(payload) {
    if (!activeProjectId) return { ok: false, error: "ابتدا یک پروژه انتخاب کنید." };
    try {
      const label = await api.createLabel(activeProjectId, payload);
      setProjectLabels((prev) => ({
        ...prev,
        [activeProjectId]: { ...(prev[activeProjectId] || {}), [label.id]: label },
      }));
      return { ok: true, label };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function handleUpdateLabel(id, payload) {
    try {
      const label = await api.updateLabel(id, payload);
      setProjectLabels((prev) => ({
        ...prev,
        [activeProjectId]: { ...(prev[activeProjectId] || {}), [label.id]: label },
      }));
      return { ok: true, label };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function handleDeleteLabel(id) {
    try {
      await api.deleteLabel(id);
      setProjectLabels((prev) => {
        const map = { ...(prev[activeProjectId] || {}) };
        delete map[id];
        return { ...prev, [activeProjectId]: map };
      });
      // این لیبل را از همه‌ی تسک‌های همین پروژه هم پاک کن
      setTasks((prev) => {
        const next = {};
        Object.entries(prev).forEach(([tid, t]) => {
          next[tid] = { ...t, labelIds: (t.labelIds || []).filter((lid) => lid !== id) };
        });
        return next;
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function handleRemoveMember(projectId, userId) {
    try {
      await api.removeProjectMember(projectId, userId);
      setProjectMembers((prev) => {
        const map = { ...(prev[projectId] || {}) };
        delete map[userId];
        return { ...prev, [projectId]: map };
      });
      // اگر این عضو مسئول تسکی در همین پروژه بود، محلی هم پاک کن
      if (projectId === activeProjectId) {
        setTasks((prev) => {
          const next = {};
          Object.entries(prev).forEach(([tid, t]) => {
            next[tid] = t.assigneeId === userId ? { ...t, assigneeId: "" } : t;
          });
          return next;
        });
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function handleAddMemberToProject(projectId, userId) {
    try {
      await api.addProjectMember(projectId, { userId, role: "member" });
      await loadProjectMembers(projectId);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function handleMoveMember(userId, fromProjectId, toProjectId) {
    try {
      await api.addProjectMember(toProjectId, { userId, role: "member" });
      await api.removeProjectMember(fromProjectId, userId);
      await loadProjectMembers(toProjectId);
      setProjectMembers((prev) => {
        const map = { ...(prev[fromProjectId] || {}) };
        delete map[userId];
        return { ...prev, [fromProjectId]: map };
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  function openInviteFor(projectId) {
    setInviteTargetProjectId(projectId || activeProjectId);
    setShowInviteModal(true);
  }

  async function quickAddTask() {
    if (!canCreate || !board.columns?.length) return;
    const firstCol = board.columns[0];
    try {
      const created = await api.createTask(firstCol.id, {
        title: "تسک جدید",
        priority: "medium",
      });
      setTasks((prev) => ({ ...prev, [created.id]: created }));
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === firstCol.id ? { ...c, taskIds: [...c.taskIds, created.id] } : c
        ),
      }));
      setOpenTask(created.id);
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleSaveTask(updated) {
    // به‌روزرسانی خوش‌بینانه
    setTasks((prev) => ({ ...prev, [updated.id]: updated }));
    try {
      const saved = await api.updateTask(updated.id, {
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        assigneeId: updated.assigneeId || null,
        dueDate: updated.dueDate || "",
        labelIds: updated.labelIds || [],
      });
      // توجه: چک‌لیست/کامنت‌ها/پیوست‌ها از اندپوینت‌های اختصاصی خودشان می‌آیند
      // و ممکن است همزمان با این درخواست در حال تغییر باشند؛ پاسخ این تسک را
      // فقط برای فیلدهای اصلی خودش می‌گیریم تا رویدادهای موازی را رونویسی نکند.
      setTasks((prev) => ({
        ...prev,
        [saved.id]: {
          ...updated,
          id: saved.id,
          title: saved.title,
          description: saved.description,
          priority: saved.priority,
          assigneeId: saved.assigneeId,
          dueDate: saved.dueDate,
          labelIds: saved.labelIds,
        },
      }));
    } catch (e) {
      alert(e.message);
      // رفرش از سرور
      loadBoard(activeProjectId);
    }
  }

  async function handleDeleteTask(taskId) {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => ({
        ...c,
        taskIds: c.taskIds.filter((id) => id !== taskId),
      })),
    }));
    setTasks((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setOpenTask(null);
    try {
      await api.deleteTask(taskId);
    } catch (e) {
      alert(e.message);
      loadBoard(activeProjectId);
    }
  }

  function handleNavigate(p) {
    setPage(p);
    if (p === "inbox") setInboxVisited(true);
    if ((p === "inbox" || p === "calendar") && projectsList.length) {
      loadAllBoards(projectsList);
    }
    setSearchQuery("");
    setMobileNavOpen(false);
  }

  function handleSelectProject(id) {
    setActiveProjectId(id);
    setPage("boards");
    setMobileNavOpen(false);
    if (!boardsData[id]) loadBoard(id);
  }

  async function handleCreateProject({ name, icon }) {
    try {
      const project = await api.createProject({ name, icon });
      setProjectsList((prev) => [...prev, project]);
      // برد خالی را از سرور بگیر
      await loadBoard(project.id);
      setActiveProjectId(project.id);
      setPage("boards");
      setShowProjectModal(false);
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleInvite(payload) {
    const { mode = "addToProject", email, name, role } = payload;
    const targetProjectId = inviteTargetProjectId || activeProjectId;

    // افزودن کاربر موجود به پروژه فعلی
    if (mode === "addToProject") {
      if (!targetProjectId) {
        return { ok: false, error: "ابتدا یک پروژه انتخاب کنید." };
      }
      try {
        await api.addProjectMember(targetProjectId, { email, role: "member" });
        await loadProjectMembers(targetProjectId);
        setShowInviteModal(false);
        setInviteTargetProjectId(null);
        alert("عضو به این پروژه اضافه شد.");
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    // ساخت کاربر جدید در سیستم (ادمین)
    const result = await inviteMember({ name, email, role });
    if (result.ok) {
      // اگر پروژه‌ی مقصدی مشخص است، به آن پروژه هم اضافه کن
      if (targetProjectId) {
        try {
          await api.addProjectMember(targetProjectId, { email, role: "member" });
          await loadProjectMembers(targetProjectId);
        } catch {
          /* کاربر ساخته شده؛ عضویت پروژه اختیاری */
        }
      }
      setShowInviteModal(false);
      setInviteTargetProjectId(null);
      if (result.tempPassword) {
        alert(`کاربر ساخته شد. رمز موقت: ${result.tempPassword}`);
      }
    }
    return result;
  }

  // درگ‌اند‌دراپ: بعد از جابه‌جایی محلی، به سرور بفرست
  async function persistTaskMove(taskId, columnId, position) {
    try {
      await api.updateTask(taskId, { columnId, position });
    } catch (e) {
      console.error(e);
      loadBoard(activeProjectId);
    }
  }

  async function handleDeleteColumn(columnId) {
    try {
      await api.deleteColumn(columnId);
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.filter((c) => c.id !== columnId),
      }));
      // تسک‌های آن ستون را از state محلی هم بردار
      setTasks((prev) => {
        const col = board.columns.find((c) => c.id === columnId);
        if (!col) return prev;
        const next = { ...prev };
        col.taskIds.forEach((id) => delete next[id]);
        return next;
      });
    } catch (e) {
      alert(e.message);
      loadBoard(activeProjectId);
    }
  }


async function handleRenameProject(newName) {
    if (!activeProjectId || !newName?.trim()) return;
    const name = newName.trim();
    try {
      const updated = await api.updateProject(activeProjectId, { name });
      const finalName = updated?.name || name;
      setProjectsList((prev) =>
        prev.map((p) => (p.id === activeProjectId ? { ...p, name: finalName } : p))
      );
      setBoard((prev) => (prev ? { ...prev, title: finalName } : prev));
      setBoardsData((prev) => {
        const cur = prev[activeProjectId];
        if (!cur) return prev;
        return {
          ...prev,
          [activeProjectId]: {
            ...cur,
            board: cur.board ? { ...cur.board, title: finalName } : cur.board,
          },
        };
      });
    } catch (e) {
      alert(e.message || "تغییر نام ناموفق بود.");
      throw e;
    }
  }

  async function handleRenameColumn(columnId, newTitle) {
    try {
      await api.updateColumn(columnId, { title: newTitle });
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === columnId ? { ...c, title: newTitle } : c
        ),
      }));
    } catch (e) {
      alert(e.message);
      throw e;
    }
  }

  async function handleAddColumn(title) {
    if (!canCreate) return;
    try {
      const col = await api.createColumn(activeProjectId, { title });
      setBoard((prev) => ({
        ...prev,
        columns: [...prev.columns, col],
      }));
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleAddTaskInColumn(columnId, title) {
    if (!canCreate) return;
    try {
      const created = await api.createTask(columnId, { title, priority: "medium" });
      setTasks((prev) => ({ ...prev, [created.id]: created }));
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === columnId ? { ...c, taskIds: [...c.taskIds, created.id] } : c
        ),
      }));
    } catch (e) {
      alert(e.message);
    }
  }

  const allTasksAcrossProjects = Object.values(boardsData).flatMap((entry) =>
    Object.values(entry.tasks || {})
  );
  const allTasksMap = {};
  Object.values(boardsData).forEach((entry) => {
    Object.assign(allTasksMap, entry.tasks || {});
  });

  function findProjectIdForTask(taskId) {
    for (const [pid, entry] of Object.entries(boardsData)) {
      if (entry?.tasks?.[taskId]) return pid;
    }
    return activeProjectId;
  }

  function openTaskFromAnywhere(taskOrId) {
    const id = typeof taskOrId === "string" ? taskOrId : taskOrId?.id;
    if (!id) return;
    const pid = findProjectIdForTask(id);
    if (pid && pid !== activeProjectId) {
      setActiveProjectId(pid);
      setPage("boards");
    }
    openTaskPanel(id);
  }

  const todayStr = getTodayJalaliStr();
  const inboxCount = inboxVisited
    ? 0
    : allTasksAcrossProjects.reduce((sum, t) => {
        const own = (t.comments || []).filter((c) => c.authorId !== currentUser.id).length;
        const assigned = t.assigneeId === currentUser.id ? 1 : 0;
        const isMine = t.assigneeId === currentUser.id;
        const dueStr = t.dueDate ? String(t.dueDate).replace(/-/g, "/") : "";
        const due = isMine && dueStr && dueStr <= todayStr ? 1 : 0;
        return sum + own + assigned + due;
      }, 0);

  return (
    <div className="app">
      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        projectsList={projectsList}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={() => setShowProjectModal(true)}
        inboxCount={inboxCount}
        onInvite={() => openInviteFor(activeProjectId)}
        onOpenProfile={() => setShowProfileModal(true)}
        isMobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="app__main">
        <Topbar
          boardTitle={board?.title || projectsList.find((p) => p.id === activeProjectId)?.name || "…"}
          page={page}
          view={view}
          onViewChange={setView}
          onNewTask={quickAddTask}
          canCreate={canCreate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onRenameBoard={handleRenameProject}
        />

        {bootError && (
          <div style={{ padding: "12px 20px", background: "#fee", color: "#900", fontSize: 14 }}>
            {bootError} — مطمئن شو بک‌اند لاراول (php artisan serve) روشن باشد و پروکسی Vite به پورت 8000 باشد.
          </div>
        )}

        {loadingBoard && page === "boards" && (
          <div style={{ padding: 24, opacity: 0.7 }}>در حال بارگذاری برد…</div>
        )}

        {page === "boards" && !loadingBoard && !activeProjectId && projectsList.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", maxWidth: 420, margin: "40px auto" }}>
            <h2 style={{ marginBottom: 8 }}>خوش آمدی</h2>
            <p style={{ opacity: 0.75, marginBottom: 20, lineHeight: 1.7 }}>
              هنوز پروژه‌ای نداری. اولین پروژه را بساز تا بورد و ستون‌های پیش‌فرض برایت ساخته شود.
            </p>
            <button
              type="button"
              className="topbar__new-task"
              onClick={() => setShowProjectModal(true)}
              style={{ cursor: "pointer" }}
            >
              + ساخت پروژه
            </button>
          </div>
        )}

        {page === "boards" && !loadingBoard && activeProjectId && (
          <Board
            board={board}
            setBoard={setBoard}
            tasks={tasks}
            setTasks={setTasks}
            view={view}
            searchQuery={searchQuery}
            onOpenTask={openTaskPanel}
            onPersistMove={persistTaskMove}
            onAddColumn={handleAddColumn}
            onDeleteColumn={handleDeleteColumn}
            onRenameColumn={handleRenameColumn}
            onAddTask={handleAddTaskInColumn}
            labelsMap={labelsMap}
          />
        )}

        {page === "home" && (
          <HomePage
            board={board}
            tasks={tasks}
            users={users}
            currentUser={currentUser}
            onOpenTask={openTaskPanel}
            onGoToBoards={() => setPage("boards")}
          />
        )}

        {page === "inbox" && (
          <InboxPage
            tasks={allTasksMap}
            users={users}
            currentUser={currentUser}
            onOpenTask={openTaskFromAnywhere}
          />
        )}

        {page === "calendar" && (
          <CalendarPage
            tasks={allTasksMap}
            users={users}
            onOpenTask={openTaskFromAnywhere}
          />
        )}

        {page === "reports" && (
          <ReportsPage board={board} tasks={tasks} users={users} labels={labelsMap} />
        )}

        {page === "userManagement" && (
          <UserManagementPage
            projectsList={projectsList}
            projectMembers={projectMembers}
            boardsData={boardsData}
            currentUser={currentUser}
            allUsers={users}
            onLoadMembers={loadProjectMembers}
            onLoadBoard={loadBoard}
            onRemoveMember={handleRemoveMember}
            onMoveMember={handleMoveMember}
            onAddMember={handleAddMemberToProject}
            onUpdateUserRole={updateUserRole}
            onInvite={openInviteFor}
            onOpenProfile={setProfileDetailId}
          />
        )}
      </div>

      {openTask && (tasks[openTask] || allTasksMap[openTask]) && (
        <TaskDetail
          task={tasks[openTask] || allTasksMap[openTask]}
          onClose={() => setOpenTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          labelsMap={labelsMap}
          onCreateLabel={handleCreateLabel}
          onUpdateLabel={handleUpdateLabel}
          onDeleteLabel={handleDeleteLabel}
          projectMembers={projectMembers[activeProjectId]}
        />
      )}

      {profileDetailId && (
        <ProfileDetailModal userId={profileDetailId} onClose={() => setProfileDetailId(null)} />
      )}

      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showInviteModal && (
        <InviteModal
          onClose={() => {
            setShowInviteModal(false);
            setInviteTargetProjectId(null);
          }}
          onInvite={handleInvite}
          projectName={
            projectsList.find((p) => p.id === (inviteTargetProjectId || activeProjectId))?.name
          }
        />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
