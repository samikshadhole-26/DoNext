import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Flame, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { Card, PageShell } from "@/components/site-header";
import { taskScore } from "@/lib/donext-store";
import { useFocusSessions, useTasks } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/focus")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Focus Timer — DoNext" },
      { name: "description", content: "Run a 25-minute focus session on your top task and build a study streak." },
      { property: "og:title", content: "Focus Timer — DoNext" },
      { property: "og:description", content: "Run a 25-minute focus session on your top task and build a study streak." },
    ],
  }),
  component: FocusPage,
});

const LENGTHS = [15, 25, 45];

function FocusPage() {
  const { tasks } = useTasks();
  const { sessions, addSession } = useFocusSessions();
  const [minutes, setMinutes] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left === 0 && running && !done.current) {
      done.current = true;
      setRunning(false);
      addSession();
    }
    if (left > 0) done.current = false;
  }, [left, running, addSession]);

  function pick(m: number) {
    setMinutes(m);
    setLeft(m * 60);
    setRunning(false);
  }

  const ranked = [...tasks].filter((t) => !t.done).sort((a, b) => taskScore(b) - taskScore(a));
  const top = ranked[0];
  const pct = 100 - Math.round((left / (minutes * 60)) * 100);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <PageShell title="Focus" subtitle="One task, one timer, no tab-hopping.">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-2xl bg-primary p-8 text-center text-primary-foreground shadow-card">
          <p className="text-sm opacity-80">Working on</p>
          <p className="mt-1 text-lg font-medium">{top ? top.title : "Nothing pending — pick a break"}</p>
          <p className="mt-6 font-display text-7xl font-bold tabular-nums sm:text-8xl">
            {mm}:{ss}
          </p>
          <div className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-primary-foreground/20">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => pick(minutes)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-primary-foreground/20"
            >
              <RotateCcw className="size-4" /> Reset
            </button>
          </div>
          <div className="mt-6 flex justify-center gap-2">
            {LENGTHS.map((m) => (
              <button
                key={m}
                onClick={() => pick(m)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  minutes === m
                    ? "bg-primary-foreground/25"
                    : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <Card title="Study streak" icon={<Flame className="size-5 text-primary" />}>
            <p className="font-display text-4xl font-bold">{sessions}</p>
            <p className="text-sm text-muted-foreground">focus sessions finished</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Three a day keeps deadline panic away.
            </p>
          </Card>
          <Card title="Next up" icon={<Timer className="size-5 text-primary" />}>
            <ul className="space-y-2">
              {ranked.slice(0, 4).map((t, i) => (
                <li key={t.id} className="flex gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="font-display font-bold text-muted-foreground">{i + 1}</span>
                  <span>{t.title}</span>
                </li>
              ))}
              {ranked.length === 0 && (
                <li className="text-sm text-muted-foreground">No open tasks.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
