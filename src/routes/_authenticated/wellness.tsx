import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HeartPulse, Smile } from "lucide-react";
import { Card, PageShell } from "@/components/site-header";
import { moodLabels } from "@/lib/donext-store";
import { useMoods } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/wellness")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Mental Wellness — DoNext" },
      { name: "description", content: "Log how your day felt and watch the pattern over the week." },
      { property: "og:title", content: "Mental Wellness — DoNext" },
      { property: "og:description", content: "Log how your day felt and watch the pattern over the week." },
    ],
  }),
  component: WellnessPage,
});

const nudges = [
  "Step outside for ten minutes between lectures.",
  "Break the biggest task into two smaller ones.",
  "Message a friend you have not spoken to this week.",
  "Sleep before 1 AM tonight. Everything reads easier tomorrow.",
];

function WellnessPage() {
  const { moods, addMood } = useMoods();
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");

  const average = moods.length > 0 ? moods.reduce((s, e) => s + e.mood, 0) / moods.length : 0;
  const nudge = nudges[Math.min(nudges.length - 1, Math.max(0, 4 - Math.round(average)))];

  function log(e: React.FormEvent) {
    e.preventDefault();
    const day = new Date().toLocaleDateString("en-US", { weekday: "short" });
    addMood.mutate({ day, mood, note: note.trim() });
    setNote("");
  }

  return (
    <PageShell title="Mental Wellness" subtitle="A quick check-in beats a long crash.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="How is today going?" icon={<Smile className="size-5 text-primary" />}>
          <form onSubmit={log} className="space-y-4">
            <div className="flex gap-2">
              {moodLabels.map((m, i) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMood(i)}
                  className={`flex-1 rounded-lg border px-2 py-2.5 text-sm transition-colors ${
                    mood === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="One line about today (optional)"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={addMood.isPending}
              className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Save check-in
            </button>
          </form>
          <div className="mt-6 rounded-xl bg-accent/25 p-4">
            <p className="text-sm font-medium">Today's nudge</p>
            <p className="mt-1 text-sm text-muted-foreground">{nudge}</p>
          </div>
        </Card>

        <Card title="Your mood log" icon={<HeartPulse className="size-5 text-primary" />}>
          <p className="font-display text-4xl font-bold">{average.toFixed(1)}/4</p>
          <p className="text-sm text-muted-foreground">
            average across {moods.length} check-in{moods.length === 1 ? "" : "s"}
          </p>
          <div className="mt-5 flex items-end gap-2">
            {moods.slice(-10).map((e) => (
              <div key={e.id} className="flex-1 text-center">
                <div
                  className="mx-auto w-full rounded-t-md bg-primary"
                  style={{ height: `${20 + e.mood * 25}px` }}
                />
                <p className="mt-1 text-xs text-muted-foreground">{e.day}</p>
              </div>
            ))}
          </div>
          <ul className="mt-6 space-y-2">
            {moods
              .slice(-4)
              .reverse()
              .map((e) => (
                <li key={e.id} className="flex justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                  <span>{e.note || "No note"}</span>
                  <span className="text-muted-foreground">{moodLabels[e.mood]}</span>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
