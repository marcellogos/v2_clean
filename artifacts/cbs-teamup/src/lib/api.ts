import type { UserProfile } from "./cbs-data";

export type KCard = {
  id: string;
  title: string;
  tag: string;
  col: "todo" | "progress" | "review" | "done";
};

export type SessionResponse =
  | { active: false }
  | { active: true; email: string; name: string; token: string; profile: UserProfile | null };

export type WorkspaceState = {
  notifications: { id: number; read: boolean }[];
  checklist: Record<string, boolean>;
};

const BASE = "/api";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (email: string, name: string, password: string) =>
      post<{ ok: boolean; email: string; name: string }>("/auth/register", { email, name, password }),

    validate: (email: string, password: string) =>
      post<{ valid: boolean; name?: string; profile?: UserProfile | null }>("/auth/validate", { email, password }),

    login: (email: string, name: string) =>
      post<{ ok: boolean; token: string; profile: UserProfile | null }>("/auth/login", { email, name }),

    saveProfile: (profile: UserProfile) =>
      post<{ ok: boolean }>("/auth/profile", { profile }),

    /** Persists onboarding answers to the durable profiles map (survives logout). */
    updatePreferences: (email: string, profile: UserProfile) =>
      post<{ ok: boolean }>("/auth/update-preferences", { email, profile }),

    session: () => get<SessionResponse>("/auth/session"),

    logout: () => post<{ ok: boolean }>("/auth/logout", {}),
  },

  workspace: {
    get: () => get<WorkspaceState>("/workspace-state"),
    save: (state: Partial<WorkspaceState>) =>
      post<{ ok: boolean }>("/workspace-state", state),
  },

  kanban: {
    get: () => get<KCard[]>("/kanban-tasks"),
    save: (tasks: KCard[]) => post<{ ok: boolean }>("/kanban-tasks", tasks),
  },
};
