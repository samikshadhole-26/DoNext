import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { loadData, newId, updateData, type Profile, type UserData } from "./local-db";
import type { Task } from "./donext-store";

export type { Profile };

function useUserData() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const query = useQuery({
    queryKey: ["data", userId],
    enabled: !!userId,
    queryFn: () => loadData(userId!),
  });
  const mutate = <A,>(fn: (d: UserData, arg: A) => UserData) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMutation({
      mutationFn: async (arg: A) => {
        if (!userId) throw new Error("Not signed in");
        await updateData(userId, (d) => fn(d, arg));
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["data", userId] }),
    });
  return { data: query.data, loading: query.isPending, mutate };
}

export function useTasks() {
  const { data, loading, mutate } = useUserData();
  const addTask = mutate<{ title: string; dueInDays: number; priority: number }>((d, t) => ({
    ...d,
    tasks: [...d.tasks, { id: newId(), done: false, ...t }],
  }));
  const toggleTask = mutate<Task>((d, t) => ({
    ...d,
    tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
  }));
  const deleteTask = mutate<string>((d, id) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) }));
  return { tasks: data?.tasks ?? [], loading, addTask, toggleTask, deleteTask };
}

export function useExpenses() {
  const { data, loading, mutate } = useUserData();
  const addExpense = mutate<{ label: string; amount: number; category: string }>((d, e) => ({
    ...d,
    expenses: [...d.expenses, { id: newId(), ...e }],
  }));
  const deleteExpense = mutate<string>((d, id) => ({
    ...d,
    expenses: d.expenses.filter((x) => x.id !== id),
  }));
  return { expenses: data?.expenses ?? [], loading, addExpense, deleteExpense };
}

export function useMoods() {
  const { data, loading, mutate } = useUserData();
  const addMood = mutate<{ day: string; mood: number; note: string }>((d, m) => ({
    ...d,
    moods: [...d.moods, { id: newId(), ...m }],
  }));
  return { moods: data?.moods ?? [], loading, addMood };
}

function fileToDataUrl(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale;
      c.height = img.height * scale;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function useProfile() {
  const { data, loading, mutate } = useUserData();
  const updateProfile = mutate<Partial<Omit<Profile, "id">>>((d, p) => ({
    ...d,
    profile: { ...d.profile, ...p },
  }));
  const setAvatar = mutate<string>((d, url) => ({ ...d, profile: { ...d.profile, avatar_url: url } }));
  const uploadAvatar = {
    ...setAvatar,
    mutate: (file: File) => void fileToDataUrl(file).then((u) => setAvatar.mutate(u)),
    mutateAsync: async (file: File) => setAvatar.mutateAsync(await fileToDataUrl(file)),
  };
  return {
    profile: data?.profile ?? null,
    loading,
    avatarUrl: data?.profile.avatar_url ?? null,
    updateProfile,
    uploadAvatar,
  };
}

export function useFocusSessions() {
  const { profile, updateProfile } = useProfile();
  const sessions = profile?.focus_sessions ?? 0;
  return { sessions, addSession: () => updateProfile.mutate({ focus_sessions: sessions + 1 }) };
}
