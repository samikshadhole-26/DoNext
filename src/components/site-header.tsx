import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Sparkles } from "lucide-react";
import { signOut as localSignOut } from "@/lib/local-db";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/donext-data";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/calendar", label: "Calendar" },
  { to: "/budget", label: "Budget" },
  { to: "/wellness", label: "Wellness" },
  { to: "/focus", label: "Focus" },
  { to: "/insights", label: "Insights" },
] as const;

export function SiteHeader() {
  const { session } = useAuth();
  const { profile, avatarUrl } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    localSignOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-card/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <Link to={session ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">DoNext</span>
        </Link>

        {session ? (
          <>
            <nav className="flex flex-1 flex-wrap items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{ className: "bg-brand-gradient text-primary-foreground shadow-glow hover:text-primary-foreground" }}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="size-8 rounded-full object-cover ring-2 ring-primary/20" />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-secondary text-sm font-bold ring-2 ring-primary/20 text-secondary-foreground">
                    {(profile?.display_name || session.user.email || "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="max-w-40 truncate text-sm text-muted-foreground">
                  {profile?.display_name || session.user.email}
                </span>
              </Link>
              <Button variant="ghost" size="icon"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 justify-end">
            <Button asChild size="sm"><Link
              to="/auth"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in
            </Link></Button>
          </div>
        )}
      </div>
    </header>
  );
}

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}

export function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border/70 bg-card p-6 shadow-card transition-shadow hover:shadow-glow/30 ${className}`}>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
