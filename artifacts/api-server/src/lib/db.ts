import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.resolve(process.cwd(), "db.json");

export type KCard = {
  id: string;
  title: string;
  tag: string;
  col: "todo" | "progress" | "review" | "done";
};

export type UserProfile = {
  name: string;
  email: string;
  course: string;
  degree: string;
  semester: string;
  traits: {
    leadership: number;
    analytical: number;
    complexity: number;
    research: number;
    vision: number;
  };
  strengths: string[];
  weaknesses: string[];
};

export type Session = {
  active: boolean;
  email: string;
  name: string;
  token: string;
  profile: UserProfile | null;
};

export type WorkspaceState = {
  notifications: { id: number; read: boolean }[];
  checklist: Record<string, boolean>;
};

export type UserRecord = {
  email: string;
  name: string;
  password: string;
};

export type DbShape = {
  session: Session | null;
  kanbanTasks: KCard[] | null;
  workspaceState: WorkspaceState | null;
  users: UserRecord[];
  /** Persistent profile store keyed by email — survives logout */
  profiles: Record<string, UserProfile>;
};

const DEFAULT_DB: DbShape = {
  session: null,
  kanbanTasks: null,
  workspaceState: null,
  users: [],
  profiles: {},
};

export function readDb(): DbShape {
  try {
    if (!fs.existsSync(DB_PATH)) return { ...DEFAULT_DB };
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      ...DEFAULT_DB,
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      profiles: (parsed.profiles && typeof parsed.profiles === "object" && !Array.isArray(parsed.profiles))
        ? parsed.profiles
        : {},
    };
  } catch {
    return { ...DEFAULT_DB };
  }
}

export function writeDb(data: DbShape): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // silently fail — server stays up
  }
}

export function updateDb(patch: Partial<DbShape>): DbShape {
  const current = readDb();
  const next = { ...current, ...patch };
  writeDb(next);
  return next;
}
