import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, ListTodo, Plus, Trash2 } from "lucide-react";
import { Card, PageShell } from "@/components/site-header";
import { dueLabel, priorityNames, urgencyTone } from "@/lib/donext-store";
import { useTasks } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Tasks — DoNext" },
      { name: "description", content: "Add, prioritise and tick off your college tasks in DoNext." },
      { property: "og:title", content: "Tasks — DoNext" },
      { property: "og:description", content: "Add, prioritise and tick off your college tasks in DoNext." },
    ],
  }),
  component: TasksPage,
});

function dateFromDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysFromDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const target = new Date(y!, m! - 1, d!);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
}

function TasksPage() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(3);
  const [priority, setPriority] = useState(2);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  const shown = tasks.filter((t) =>
    filter === "all" ? true : filter === "open" ? !t.done : t.done,
  );

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask.mutate({ title: title.trim(), dueInDays: days, priority });
    setTitle("");
    setDays(3);
    setPriority(2);
  }

  return (
    <PageShell title="Tasks" subtitle="Everything you owe your semester, in one list.">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card title="Your list" icon={<ListTodo className="size-5 text-primary" />}>
          <div className="mb-3 flex gap-2">
            {(["all", "open", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <ul className="divide-y divide-border">
            {loading && <li className="py-6 text-sm text-muted-foreground">Loading…</li>}
            {!loading && shown.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">Nothing here yet.</li>
            )}
            {shown.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-3">
                <button onClick={() => toggleTask.mutate(task)} aria-label="Toggle task">
                  {task.done ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={task.done ? "text-muted-foreground line-through" : "font-medium"}>
                    {task.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {priorityNames[task.priority] ?? "Medium"} priority
                  </p>
                </div>
                <span
                  className={`text-sm ${task.done ? "text-muted-foreground" : urgencyTone(task.dueInDays)}`}
                >
                  {dueLabel(task.dueInDays)}
                </span>
                <button
                  onClick={() => deleteTask.mutate(task.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Delete task"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Add a task" icon={<Plus className="size-5 text-primary" />}>
          <form onSubmit={add} className="space-y-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
            />

            <fieldset>
              <legend className="text-sm font-semibold">How important is it?</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { p: 1, hint: "Whenever", dot: "bg-later" },
                  { p: 2, hint: "Should do", dot: "bg-soon" },
                  { p: 3, hint: "Must do", dot: "bg-urgent" },
                ].map(({ p, hint, dot }) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    aria-pressed={priority === p}
                    className={`rounded-xl border px-2 py-2.5 text-center transition-all ${
                      priority === p
                        ? "border-primary bg-secondary shadow-sm ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className={`mx-auto block size-2.5 rounded-full ${dot}`} />
                    <span className="mt-1.5 block text-sm font-semibold">{priorityNames[p]}</span>
                    <span className="block text-[11px] text-muted-foreground">{hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">When is it due?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { d: 0, label: "Today" },
                  { d: 1, label: "Tomorrow" },
                  { d: 3, label: "In 3 days" },
                  { d: 7, label: "Next week" },
                ].map(({ d, label }) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDays(d)}
                    aria-pressed={days === d}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                      days === d
                        ? "border-transparent bg-brand-gradient text-primary-foreground shadow-glow"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="shrink-0">Or pick a date</span>
                <input
                  type="date"
                  value={dateFromDays(days)}
                  min={dateFromDays(0)}
                  onChange={(e) => e.target.value && setDays(daysFromDate(e.target.value))}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
                />
              </label>
              <p className="mt-2 text-xs font-medium text-primary">{dueLabel(days)}</p>
            </fieldset>

            <button
              type="submit"
              disabled={addTask.isPending}
              className="h-11 w-full rounded-xl bg-brand-gradient text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110 disabled:opacity-60"
            >
              Add task
            </button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
