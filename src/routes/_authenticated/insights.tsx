import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Flame, PiggyBank, Smile, Target } from "lucide-react";
import { Card, PageShell } from "@/components/site-header";
import { money } from "@/lib/donext-store";
import { useExpenses, useMoods, useProfile, useTasks } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Insights — DoNext" },
      { name: "description", content: "One view of study progress, spending and mood across your semester." },
      { property: "og:title", content: "Insights — DoNext" },
      { property: "og:description", content: "One view of study progress, spending and mood across your semester." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { tasks } = useTasks();
  const { expenses } = useExpenses();
  const { moods } = useMoods();
  const { profile } = useProfile();

  const sessions = profile?.focus_sessions ?? 0;
  const monthlyBudget = profile?.monthly_budget ?? 8000;
  const doneCount = tasks.filter((t) => t.done).length;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const spentPct = Math.round((spent / Math.max(1, monthlyBudget)) * 100);
  const avgMood = moods.length ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0;

  const stats = [
    { label: "Tasks completed", value: `${completion}%`, icon: <Target className="size-5" /> },
    { label: "Budget used", value: `${spentPct}%`, icon: <PiggyBank className="size-5" /> },
    { label: "Average mood", value: `${avgMood.toFixed(1)}/4`, icon: <Smile className="size-5" /> },
    { label: "Focus sessions", value: `${sessions}`, icon: <Flame className="size-5" /> },
  ];

  const takeaway =
    completion < 40
      ? "Your list is growing faster than it's shrinking. Try two focus sessions tomorrow."
      : spentPct > 80
        ? "Study is on track, but the month's money is nearly gone. Watch food spending."
        : "Balanced week. Keep the check-ins going.";

  return (
    <PageShell title="Insights" subtitle="How study, money and mood are moving together.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border/70 bg-card p-5 shadow-card">
            <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              {s.icon}
            </span>
            <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Task progress" icon={<BarChart3 className="size-5 text-primary" />}>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {doneCount} of {tasks.length} tasks done.
          </p>
          <ul className="mt-4 space-y-2">
            {tasks.slice(0, 6).map((t) => (
              <li key={t.id} className="flex justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                <span>{t.title}</span>
                <span className="text-muted-foreground">{t.done ? "Done" : "Open"}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="What this adds up to">
          <p className="text-base">{takeaway}</p>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p>
              Spending so far: {money(spent)} of {money(monthlyBudget)}.
            </p>
            <p>Mood entries logged: {moods.length}.</p>
            <p>Focus time banked: about {sessions * 25} minutes.</p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
