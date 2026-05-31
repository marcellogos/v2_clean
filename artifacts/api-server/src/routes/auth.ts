import { Router, type IRouter } from "express";
import { readDb, updateDb, type UserRecord, type UserProfile } from "../lib/db";
import crypto from "node:crypto";

const router: IRouter = Router();

// ── Preset accounts (hardcoded demo credentials) ──────────────────────────
const CBS_PASSWORD = "cbs2026";
const DEMO_PASSWORD = "demo2026";

function getPresetPasswords(email: string): string[] {
  const lower = email.toLowerCase();
  if (lower.includes("demo")) return [DEMO_PASSWORD, CBS_PASSWORD];
  return [CBS_PASSWORD];
}

const PRESET_NAMES: Record<string, string> = {
  "demo.student@cbs-mail.de": "Demo Student",
  "lena.hoffmann@cbs-mail.de": "Lena Hoffmann",
};

// ── POST /auth/register ────────────────────────────────────────────────────
router.post("/auth/register", (req, res) => {
  try {
    const { email, name, password } = req.body as {
      email?: string; name?: string; password?: string;
    };

    if (!email || !name || !password) {
      res.status(400).json({ error: "email, name, and password are required" });
      return;
    }

    const lower = email.toLowerCase().trim();
    const db = readDb();

    const existing = db.users.find((u) => u.email.toLowerCase() === lower);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const newUser: UserRecord = { email: lower, name, password };
    updateDb({ users: [...db.users, newUser] });
    res.json({ ok: true, email: lower, name });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
});

// ── POST /auth/validate ────────────────────────────────────────────────────
// Validates credentials and returns profile if the user has completed onboarding.
router.post("/auth/validate", (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const lower = email.toLowerCase().trim();
    const db = readDb();
    const savedProfile = db.profiles[lower] ?? null;

    // 1. Preset accounts
    if (PRESET_NAMES[lower] !== undefined) {
      const valid = getPresetPasswords(lower).includes(password);
      if (!valid) { res.json({ valid: false }); return; }
      res.json({ valid: true, name: PRESET_NAMES[lower], profile: savedProfile });
      return;
    }

    // 2. Registered users
    const user = db.users.find((u) => u.email.toLowerCase() === lower);
    if (!user || user.password !== password) {
      res.json({ valid: false });
      return;
    }

    res.json({ valid: true, name: user.name, profile: savedProfile });
  } catch {
    res.status(500).json({ error: "Validation failed" });
  }
});

// ── POST /auth/update-preferences ─────────────────────────────────────────
// Persists the completed onboarding profile into the durable profiles map.
// This is separate from the session — it survives logout/login cycles.
router.post("/auth/update-preferences", (req, res) => {
  try {
    const { email, profile } = req.body as { email?: string; profile?: UserProfile };

    if (!email || !profile) {
      res.status(400).json({ error: "email and profile are required" });
      return;
    }

    const lower = email.toLowerCase().trim();
    const db = readDb();

    const profiles = { ...db.profiles, [lower]: profile };
    updateDb({ profiles });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

// ── POST /auth/login ───────────────────────────────────────────────────────
// Establishes a session. Automatically restores the durable profile if one exists.
router.post("/auth/login", (req, res) => {
  try {
    const { email, name, profile: incomingProfile } = req.body as {
      email?: string; name?: string; profile?: object;
    };

    if (!email || !name) {
      res.status(400).json({ error: "email and name are required" });
      return;
    }

    const lower = email.toLowerCase().trim();
    const current = readDb();

    const token =
      current.session?.active && current.session.email === lower
        ? current.session.token
        : crypto.randomBytes(32).toString("hex");

    // Prefer incoming profile > durable profiles map > existing session profile
    const resolvedProfile =
      (incomingProfile as UserProfile | undefined) ??
      current.profiles[lower] ??
      current.session?.profile ??
      null;

    const session = { active: true, email: lower, name, token, profile: resolvedProfile };
    updateDb({ session });
    res.json({ ok: true, token, email: lower, name, profile: resolvedProfile });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// ── POST /auth/profile ─────────────────────────────────────────────────────
// Saves profile into the active session AND the durable profiles map.
router.post("/auth/profile", (req, res) => {
  try {
    const { profile } = req.body as { profile?: UserProfile };
    const db = readDb();
    if (!db.session?.active) {
      res.status(401).json({ error: "No active session" });
      return;
    }

    const lower = db.session.email.toLowerCase();
    const session = { ...db.session, profile: profile ?? null };
    const profiles = profile
      ? { ...db.profiles, [lower]: profile }
      : db.profiles;

    updateDb({ session, profiles });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// ── GET /auth/session ──────────────────────────────────────────────────────
router.get("/auth/session", (_req, res) => {
  try {
    const db = readDb();
    const { session } = db;

    if (!session?.active) { res.json({ active: false }); return; }

    // Re-hydrate profile from durable map in case session was created before profile was saved
    const durableProfile = db.profiles[session.email.toLowerCase()] ?? null;
    const resolvedProfile = session.profile ?? durableProfile;

    res.json({
      active: true,
      email: session.email,
      name: session.name,
      token: session.token,
      profile: resolvedProfile,
    });
  } catch {
    res.json({ active: false });
  }
});

// ── POST /auth/logout ──────────────────────────────────────────────────────
// Only clears the session — never touches users registry or profiles map.
router.post("/auth/logout", (_req, res) => {
  try {
    updateDb({ session: null });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
