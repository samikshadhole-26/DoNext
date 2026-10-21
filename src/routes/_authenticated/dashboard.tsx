import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ListTodo,
  PiggyBank,
  Plus,
  Smile,
  Sparkles,
} from "lucide-react";
import {
  dueLabel,
  events,
  money,
  moodLabels,
  taskScore,
  urgencyTone,
} from "@/lib/donext-store";
import { useExpenses, useMoods, useProfile, useTasks } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard — DoNext" },
      { name: "description", content: "Your tasks, week, budget and mood in one student dashboard." },
      { property: "og:title", content: "Dashboard — DoNext" },
      { property: "og:description", content: "Your tasks, week, budget and mood in one student dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { tasks, addTask, toggleTask } = useTasks();
  const { expenses } = useExpenses();
  const { moods, addMood } = useMoods();
  const { profile } = useProfile();
  const [draft, setDraft] = useState("");
  const [quickDays, setQuickDays] = useState(3);
  const [quickPriority, setQuickPriority] = useState(2);

  const open = tasks.filter((t) => !t.done);
  const ranked = useMemo(
    () => [...open].sort((a, b) => taskScore(b) - taskScore(a)).slice(0, 4),
    [open],
  );

  const budget = profile?.monthly_budget ?? 8000;
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const spentPct = Math.min(100, Math.round((spent / Math.max(1, budget)) * 100));
  const lastMood = moods.length ? moods[moods.length - 1]!.mood : 3;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    addTask.mutate({ title, dueInDays: quickDays, priority: quickPriority });
    setDraft("");
    setQuickDays(3);
    setQuickPriority(2);
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Hello{profile?.display_name ? `, ${profile.display_name}` : ""}.
      </h1>
      <p className="mt-2 text-muted-foreground">
        {open.length} open task{open.length === 1 ? "" : "s"}, {events.length} things on the calendar
        this week.
      </p>

      <section className="relative mt-8 overflow-hidden rounded-3xl bg-brand-gradient p-7 text-primary-foreground shadow-glow">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-2xl" />
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_left,black,transparent_60%)]" />
        <div className="flex items-center gap-2 text-sm/none opacity-80">
          <Sparkles className="size-4" />
          Smart Task Organizer
        </div>
        <p className="mt-3 text-sm opacity-80">Priority = urgency + deadline + your own priority</p>
        <ol className="mt-5 space-y-3">
          {ranked.length === 0 && (
            <li className="text-sm opacity-80">Nothing pending. Add a task below.</li>
          )}
          {ranked.map((task, i) => (
            <li
              key={task.id}
              className="flex items-center gap-4 rounded-xl bg-primary-foreground/10 px-4 py-3"
            >
              <span className="font-display text-lg font-bold opacity-70">{i + 1}</span>
              <span className="flex-1 font-medium">{task.title}</span>
              <span className="text-sm opacity-80">{dueLabel(task.dueInDays)}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ListTodo className="size-5 text-primary" /> To-Do List
          </h2>
          <ul className="mt-4 space-y-1">
            {tasks.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">No tasks yet.</li>
            )}
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  onClick={() => toggleTask.mutate(task)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  {task.done ? (
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={task.done ? "flex-1 text-muted-foreground line-through" : "flex-1"}>
                    {task.title}
                  </span>
                  <span
                    className={`text-sm ${task.done ? "text-muted-foreground" : urgencyTone(task.dueInDays)}`}
                  >
                    {dueLabel(task.dueInDays)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a task…"
                className="h-10 flex-1 rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
              />
              <button
                type="submit"
                className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow transition-all hover:brightness-110"
                aria-label="Add task"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5" role="group" aria-label="Importance">
                {[
                  { p: 1, label: "Low", dot: "bg-later" },
                  { p: 2, label: "Medium", dot: "bg-soon" },
                  { p: 3, label: "High", dot: "bg-urgent" },
                ].map(({ p, label, dot }) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setQuickPriority(p)}
                    aria-pressed={quickPriority === p}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
                      quickPriority === p
                        ? "border-primary bg-secondary text-secondary-foreground ring-2 ring-primary/25"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className={`size-2 rounded-full ${dot}`} /> {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5" role="group" aria-label="Due">
                {[
                  { d: 0, label: "Today" },
                  { d: 1, label: "Tomorrow" },
                  { d: 3, label: "3 days" },
                  { d: 7, label: "Week" },
                ].map(({ d, label }) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setQuickDays(d)}
                    aria-pressed={quickDays === d}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
                      quickDays === d
                        ? "border-transparent bg-brand-gradient text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </form>
          <Link to="/tasks" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Open full task board
          </Link>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="size-5 text-primary" /> Calendar &amp; Reminders
          </h2>
          <ul className="mt-4 space-y-3">
            {events.slice(0, 4).map((ev) => (
              <li key={ev.id} className="flex items-start gap-3 border-l-2 border-accent pl-3">
                <div className="flex-1">
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-sm text-muted-foreground">{ev.when}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {ev.kind}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/calendar" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            See the whole week
          </Link>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <PiggyBank className="size-5 text-primary" /> Budget Planner
          </h2>
          <p className="mt-4 font-display text-4xl font-bold">{money(Math.max(0, budget - spent))}</p>
          <p className="text-sm text-muted-foreground">left of this month's {money(budget)}</p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: `${spentPct}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{spentPct}% spent</p>
          <Link to="/budget" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Manage spending
          </Link>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Smile className="size-5 text-primary" /> Mental Wellness
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">How is today going?</p>
          <div className="mt-3 flex gap-2">
            {moodLabels.map((m, i) => (
              <button
                key={m}
                onClick={() =>
                  addMood.mutate({
                    day: new Date().toLocaleDateString("en-US", { weekday: "short" }),
                    mood: i,
                    note: "",
                  })
                }
                className={`flex-1 rounded-lg border px-2 py-2.5 text-sm transition-colors ${
                  lastMood === i
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {moods.length} check-in{moods.length === 1 ? "" : "s"} logged so far.
          </p>
          <Link to="/wellness" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Track your mood
          </Link>
        </section>
      </div>
    </main>
  );
}
