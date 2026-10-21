import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Card, PageShell } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Your profile — DoNext" },
      { name: "description", content: "Update your display name and profile picture in DoNext." },
      { property: "og:title", content: "Your profile — DoNext" },
      { property: "og:description", content: "Update your display name and profile picture in DoNext." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { profile, avatarUrl, updateProfile, uploadAvatar } = useProfile();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.display_name);
  }, [profile]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      { display_name: name.trim() },
      { onSuccess: () => setSaved(true) },
    );
  }

  return (
    <PageShell title="Your profile" subtitle="How DoNext greets you.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Details" icon={<UserRound className="size-5 text-primary" />}>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Your profile picture"
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-16 place-items-center rounded-full bg-secondary text-xl font-bold text-secondary-foreground">
                {(profile?.display_name || user?.email || "?").charAt(0).toUpperCase()}
              </span>
            )}
            <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
              {uploadAvatar.isPending ? "Uploading…" : "Change picture"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar.mutate(file);
                }}
              />
            </label>
          </div>

          <form onSubmit={save} className="mt-6 space-y-3">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              placeholder="Display name"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Save changes
            </button>
            {saved && <p className="text-sm text-muted-foreground">Saved.</p>}
          </form>
        </Card>

        <Card title="Your month">
          <p className="text-sm text-muted-foreground">
            Monthly budget is set on the Budget page. Focus sessions completed:{" "}
            {profile?.focus_sessions ?? 0}.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
