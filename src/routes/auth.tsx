import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { signIn, signUp } from "@/lib/local-db";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sign in — DoNext" },
      { name: "description", content: "Sign in or create a DoNext account to keep your tasks, budget and mood saved." },
      { property: "og:title", content: "Sign in — DoNext" },
      { property: "og:description", content: "Sign in or create a DoNext account to keep your tasks, budget and mood saved." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name.trim());
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute -left-20 top-10 size-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="animate-blob absolute -right-16 bottom-10 size-72 rounded-full bg-accent/50 blur-3xl [animation-delay:4s]" />
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>
      <div className="glass rounded-3xl p-8 shadow-glow">
        <span className="grid size-11 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-glow">
          <Sparkles className="size-5" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to pick up your semester where you left it."
            : "Your tasks, spending and mood, saved and synced."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            autoComplete="email"
            className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            placeholder="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
          />

          {error && <p className="text-sm text-urgent">{error}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

          <Button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "signin" ? "New to DoNext?" : "Already have an account?"}{" "}
          <Button variant="link"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="h-auto p-0 font-medium text-primary hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </Button>
        </p>
      </div>

      <Link to="/" className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground">
        Back to home
      </Link>
    </main>
  );
}
