import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { Card, PageShell } from "@/components/site-header";
import { expenseCategories, money } from "@/lib/donext-store";
import { useExpenses, useProfile } from "@/lib/donext-data";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Budget Planner — DoNext" },
      { name: "description", content: "Track monthly student spending by category and see what is left." },
      { property: "og:title", content: "Budget Planner — DoNext" },
      { property: "og:description", content: "Track monthly student spending by category and see what is left." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { profile, updateProfile } = useProfile();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [budgetDraft, setBudgetDraft] = useState("");

  const monthlyBudget = profile?.monthly_budget ?? 8000;
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const left = monthlyBudget - spent;
  const pct = Math.min(100, Math.round((spent / Math.max(1, monthlyBudget)) * 100));

  const byCategory = expenseCategories.map((c) => ({
    name: c,
    total: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  }));
  const max = Math.max(1, ...byCategory.map((c) => c.total));

  function add(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!label.trim() || !value) return;
    addExpense.mutate({ label: label.trim(), amount: Math.round(value), category });
    setLabel("");
    setAmount("");
  }

  function saveBudget(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(budgetDraft);
    if (!value) return;
    updateProfile.mutate({ monthly_budget: Math.round(value) });
    setBudgetDraft("");
  }

  return (
    <PageShell title="Budget Planner" subtitle="Where the month's money actually went.">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card title="This month" icon={<PiggyBank className="size-5 text-primary" />}>
            <p className="font-display text-4xl font-bold">{money(Math.max(0, left))}</p>
            <p className="text-sm text-muted-foreground">left of {money(monthlyBudget)}</p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${pct > 85 ? "bg-urgent" : "bg-accent"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{pct}% spent</p>

            <div className="mt-6 space-y-3">
              {byCategory.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{money(c.total)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.total / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={saveBudget} className="mt-6 flex gap-2">
              <input
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value)}
                inputMode="numeric"
                placeholder={`Monthly budget (now ${monthlyBudget})`}
                className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Save
              </button>
            </form>
          </Card>

          <Card title="Expenses">
            <ul className="divide-y divide-border">
              {expenses.length === 0 && (
                <li className="py-4 text-sm text-muted-foreground">No expenses logged yet.</li>
              )}
              {expenses.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <p className="font-medium">{e.label}</p>
                    <p className="text-sm text-muted-foreground">{e.category}</p>
                  </div>
                  <span className="font-medium">{money(e.amount)}</span>
                  <button
                    onClick={() => deleteExpense.mutate(e.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Add an expense" icon={<Plus className="size-5 text-primary" />}>
          <form onSubmit={add} className="space-y-3">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What did you buy?"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="Amount in ₹"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid grid-cols-2 gap-2">
              {expenseCategories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                    category === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={addExpense.isPending}
              className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Add expense
            </button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
