import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarDays } from "lucide-react";
import { Card, PageShell } from "@/components/site-header";
import { dueLabel, events } from "@/lib/donext-store";
import { useTasks } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Calendar & Reminders — DoNext" },
      { name: "description", content: "Classes, exams and deadlines for the week, with reminders." },
      { property: "og:title", content: "Calendar & Reminders — DoNext" },
      { property: "og:description", content: "Classes, exams and deadlines for the week, with reminders." },
    ],
  }),
  component: CalendarPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const load = [2, 3, 1, 4, 2, 0, 1];

function CalendarPage() {
  const { tasks } = useTasks();
  const deadlines = [...tasks].filter((t) => !t.done).sort((a, b) => a.dueInDays - b.dueInDays);

  return (
    <PageShell title="Calendar & Reminders" subtitle="Your week, and what it is about to demand.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="This week" icon={<CalendarDays className="size-5 text-primary" />}>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <div key={d} className="rounded-xl bg-muted p-2 text-center">
                <p className="text-xs text-muted-foreground">{d}</p>
                <p className="mt-1 font-display text-xl font-bold">{load[i]}</p>
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-3">
            {events.map((ev) => (
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
        </Card>

        <Card title="Reminders from your tasks" icon={<Bell className="size-5 text-primary" />}>
          <ul className="space-y-3">
            {deadlines.length === 0 && (
              <li className="text-sm text-muted-foreground">No open deadlines. Rare and lovely.</li>
            )}
            {deadlines.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <span className="font-medium">{t.title}</span>
                <span className="text-sm text-muted-foreground">{dueLabel(t.dueInDays)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Reminders fire the evening before anything is due.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
