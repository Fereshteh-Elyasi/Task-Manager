import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "./Column";
import TaskCard from "./TaskCard";
import ListView from "./ListView";
import "./Board.css";

export default function Board({
  board,
  setBoard,
  tasks,
  setTasks,
  view = "board",
  searchQuery = "",
  onOpenTask,
  onPersistMove,
  onAddTask,
  onAddColumn,
  onDeleteColumn,
  onRenameColumn,
  labelsMap,
}) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const query = searchQuery.trim().toLowerCase();

  function matches(task) {
    if (!query) return true;
    return (task.title || "").toLowerCase().includes(query);
  }

  function findColumnOf(taskId, columns = board.columns) {
    return columns.find((c) => c.taskIds.includes(taskId));
  }

  function handleDragStart(event) {
    setActiveTask(tasks[event.active.id] || null);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    setBoard((prev) => {
      const columns = prev.columns.map((c) => ({ ...c, taskIds: [...c.taskIds] }));
      const sourceCol = columns.find((c) => c.taskIds.includes(activeId));
      const destCol =
        columns.find((c) => c.id === overId) ||
        columns.find((c) => c.taskIds.includes(overId));
      if (!sourceCol || !destCol || sourceCol.id === destCol.id) return prev;

      sourceCol.taskIds = sourceCol.taskIds.filter((id) => id !== activeId);
      const overIndex = destCol.taskIds.indexOf(overId);
      destCol.taskIds.splice(overIndex >= 0 ? overIndex : destCol.taskIds.length, 0, activeId);
      return { ...prev, columns };
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setBoard((prev) => {
      const columns = prev.columns.map((c) => ({ ...c, taskIds: [...c.taskIds] }));
      const col = columns.find((c) => c.taskIds.includes(activeId));
      if (!col) return prev;

      // مرتب‌سازی داخل همان ستون
      const oldIndex = col.taskIds.indexOf(activeId);
      const newIndex = col.taskIds.indexOf(overId);
      if (newIndex !== -1 && oldIndex !== -1 && oldIndex !== newIndex) {
        col.taskIds = arrayMove(col.taskIds, oldIndex, newIndex);
      }

      const position = col.taskIds.indexOf(activeId);
      if (onPersistMove && position >= 0) {
        // async — عمداً fire-and-forget
        onPersistMove(activeId, col.id, position);
      }

      return { ...prev, columns };
    });
  }

  function addTask(columnId, title) {
    if (onAddTask) {
      onAddTask(columnId, title);
      return;
    }
    const id = "t-" + Math.random().toString(36).slice(2, 9);
    setTasks((prev) => ({
      ...prev,
      [id]: {
        id,
        title,
        description: "",
        priority: "medium",
        labelIds: [],
        assigneeId: "",
        dueDate: "",
        checklist: [],
        attachments: [],
        comments: [],
      },
    }));
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, taskIds: [...c.taskIds, id] } : c
      ),
    }));
  }

  const noResults =
    query &&
    board.columns.every(
      (c) => c.taskIds.map((id) => tasks[id]).filter(Boolean).filter(matches).length === 0
    );

  return (
    <>
      {view === "list" ? (
        <ListView board={board} tasks={tasks} matches={matches} onOpenTask={onOpenTask} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="board">
            {board.columns.map((col) => (
              <Column
                key={col.id}
                column={col}
                tasks={col.taskIds.map((id) => tasks[id]).filter(Boolean).filter(matches)}
                onOpenTask={onOpenTask}
                onAddTask={addTask}
                onDeleteColumn={onDeleteColumn}
                onRenameColumn={onRenameColumn}
                hideAddControls={!!query}
                labelsMap={labelsMap}
              />
            ))}
            {onAddColumn && (
              <button
                type="button"
                className="board__add-column"
                onClick={() => {
                  const title = window.prompt("نام ستون جدید:");
                  if (title && title.trim()) onAddColumn(title.trim());
                }}
              >
                + ستون جدید
              </button>
            )}
          </div>
          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} onOpen={() => {}} labelsMap={labelsMap} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {noResults && (
        <p className="board__no-results">هیچ تسکی با «{searchQuery}» پیدا نشد.</p>
      )}
    </>
  );
}
