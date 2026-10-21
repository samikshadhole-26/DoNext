import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CheckCircle2, Flame, ListTodo, PiggyBank, Smile, Sparkles, Timer } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "DoNext — One place for student life" },
      {
        name: "description",
        content:
          "DoNext brings your to-do list, class calendar, budget and wellness check-in together, then tells you what to do next.",
      },
      { property: "og:title", content: "DoNext — One place for student life" },
      {
        property: "og:description",
        content:
          "DoNext brings your to-do list, class calendar, budget and wellness check-in together, then tells you what to do next.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: <ListTodo className="size-5" />, title: "Smart task order", text: "Deadlines and priority decide what you do next.", tone: "grad-ocean" },
  { icon: <CalendarDays className="size-5" />, title: "Week at a glance", text: "Classes, labs, exams and deadlines in one view.", tone: "grad-sky" },
  { icon: <PiggyBank className="size-5" />, title: "Budget planner", text: "Track the month's spending by category.", tone: "grad-green" },
  { icon: <Smile className="size-5" />, title: "Mood check-ins", text: "A quick daily log that spots rough patches early.", tone: "grad-amber" },
  { icon: <Timer className="size-5" />, title: "Focus timer", text: "Short sessions on your top task, with a streak.", tone: "grad-rose" },
  { icon: <Sparkles className="size-5" />, title: "Insights", text: "How study, money and mood move together.", tone: "grad-teal" },
];

const preview = [
  { title: "DSA Assignment", meta: "Due tomorrow", tag: "Urgent", color: "bg-urgent" },
  { title: "Physics Lab report", meta: "Fri · 2:00 PM", tag: "Soon", color: "bg-soon" },
  { title: "Read Chapter 4", meta: "Next week", tag: "Later", color: "bg-later" },
];

function Landing() {
  const { session } = useAuth();

  const cta = session ? "/dashboard" : "/auth";

  return (
    <main className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
      {/* decorative background */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[34rem] w-screen -translate-x-1/2">
        <div className="animate-blob absolute -left-24 top-0 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="animate-blob absolute right-0 top-16 size-72 rounded-full bg-accent/50 blur-3xl [animation-delay:3s]" />
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <section className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold text-secondary-foreground">
            <span className="grid size-5 place-items-center rounded-full bg-brand-gradient text-primary-foreground">
              <Sparkles className="size-3" />
            </span>
            Built for college life
          </p>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[3.6rem]">
            Stop guessing what to <span className="text-brand-gradient">do next.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            DoNext keeps your tasks, timetable, money and mood in one place, then ranks the work by
            what is actually urgent.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to={cta} className="group inline-flex h-12 items-center gap-2 px-7">
                {session ? "Open your dashboard" : "Get started free"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            {!session && (
              <Button asChild variant="outline" size="lg">
                <Link to="/auth" className="inline-flex h-12 items-center px-7">
                  I already have an account
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
            {["Free to use", "Works on any device", "No clutter"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* floating product preview */}
        <div aria-hidden className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-brand-gradient opacity-20 blur-2xl" />
          <div className="glass relative rounded-3xl p-5 shadow-glow">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-bold">What to do next</p>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Today</span>
            </div>
            <ul className="mt-4 space-y-3">
              {preview.map((t, i) => (
                <li key={t.title} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm" style={{ animation: `fade-up 0.6s ${0.3 + i * 0.12}s both` }}>
                  <span className={`size-2.5 shrink-0 rounded-full ${t.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.meta}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{t.tag}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-brand-gradient" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">2 of 3 tasks done today</p>
          </div>
          <div className="animate-float glass absolute -right-4 -top-6 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold shadow-card [--r:4deg]">
            <Flame className="size-4 text-urgent" /> 5-day streak
          </div>
          <div className="animate-float glass absolute -bottom-9 -left-6 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold shadow-card [--r:-3deg] [animation-delay:1.5s]">
            <Smile className="size-4 text-soon" /> Feeling good
          </div>
        </div>
      </section>

      <section className="mt-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Everything in one place</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Six tools. One calm dashboard.</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
              <div className={`absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30 ${f.tone}`} />
              <span className={`relative grid size-12 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${f.tone}`}>
                {f.icon}
              </span>
              <h3 className="relative mt-5 text-lg font-bold">{f.title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mt-28 overflow-hidden rounded-[2rem] bg-brand-gradient px-8 py-14 text-center text-primary-foreground shadow-glow">
        <div aria-hidden className="bg-dots absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to know what's next?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/85">Set up in a minute. Your first priority list is ready right away.</p>
        <Link to={cta} className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-primary shadow-lg transition-transform hover:-translate-y-0.5">
          {session ? "Open your dashboard" : "Get started free"} <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
