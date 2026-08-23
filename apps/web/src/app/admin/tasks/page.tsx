"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdBy: { firstName: string; lastName: string };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function AdminTasksPage() {
  const { fetchWithAuth } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [fetchWithAuth]);

  const handleAddTask = async (event: FormEvent) => {
    event.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetchWithAuth("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        setAddError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setTasks((current) => [data.task, ...current]);
      setNewTitle("");
    } catch {
      setAddError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const res = await fetchWithAuth(`/api/admin/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setTasks((current) => current.map((t) => (t.id === taskId ? data.task : t)));
  };

  const handleDelete = async (taskId: string) => {
    const res = await fetchWithAuth(`/api/admin/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) return;
    setTasks((current) => current.filter((t) => t.id !== taskId));
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Tasks</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/60">
          Internal ops todos — not visible to clients.
        </p>
      </div>

      <form onSubmit={(e) => void handleAddTask(e)} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task..."
          required
          className="min-w-[240px] flex-1 rounded-lg border border-glass-border bg-surface px-3 py-2 text-sm text-foreground"
        />
        <button
          type="submit"
          disabled={adding}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {adding ? "Adding..." : "Add Task"}
        </button>
      </form>
      {addError && <p className="text-xs text-red-600">{addError}</p>}

      {loading ? (
        <p className="text-foreground/60">Loading tasks...</p>
      ) : error ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">Couldn&apos;t load tasks. Refresh to try again.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">No tasks yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium text-foreground ${task.status === "DONE" ? "line-through opacity-50" : ""}`}
                >
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-foreground/50">
                  Added by {task.createdBy.firstName} {task.createdBy.lastName}
                  {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => void handleStatusChange(task.id, e.target.value as TaskStatus)}
                  aria-label={`Status for ${task.title}`}
                  className="rounded-lg border border-glass-border bg-background px-2 py-1.5 text-xs text-foreground"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void handleDelete(task.id)}
                  aria-label={`Delete ${task.title}`}
                  className="rounded-full border border-glass-border p-2 text-foreground/50 transition-colors hover:border-red-500/40 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
