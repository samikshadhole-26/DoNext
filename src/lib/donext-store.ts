export type Task = {
  id: string;
  title: string;
  dueInDays: number;
  priority: number;
  done: boolean;
};

export type Expense = { id: string; label: string; amount: number; category: string };

export type MoodEntry = { id: string; day: string; mood: number; note: string };

export const events = [
  { id: 1, title: "DBMS Lecture", when: "Today · 9:00 AM", kind: "Class" },
  { id: 2, title: "DSA Assignment due", when: "Tomorrow · 11:59 PM", kind: "Deadline" },
  { id: 3, title: "Physics Lab", when: "Fri · 2:00 PM", kind: "Class" },
  { id: 4, title: "Mid-term: Maths", when: "Mon · 10:00 AM", kind: "Exam" },
  { id: 5, title: "Club meet", when: "Sat · 5:00 PM", kind: "Event" },
];

export const moodLabels = ["Rough", "Low", "Okay", "Good", "Great"];

export const priorityNames: Record<number, string> = { 1: "Low", 2: "Medium", 3: "High" };

export const expenseCategories = ["Food", "Study", "Travel", "Fun"];

export function dueLabel(days: number) {
  if (days <= 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function urgencyTone(days: number) {
  if (days <= 1) return "text-urgent";
  if (days <= 3) return "text-soon";
  return "text-later";
}

export function taskScore(task: Task) {
  return Math.max(0, 10 - task.dueInDays) * 2 + task.priority * 3;
}

export const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
