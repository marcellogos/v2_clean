import { Router, type IRouter } from "express";
import { readDb, updateDb, type WorkspaceState } from "../lib/db";

const router: IRouter = Router();

const DEFAULT_WORKSPACE: WorkspaceState = {
  notifications: [
    { id: 1, read: false },
    { id: 2, read: false },
  ],
  checklist: {},
};

router.get("/workspace-state", (_req, res) => {
  try {
    const { workspaceState } = readDb();
    res.json(workspaceState ?? DEFAULT_WORKSPACE);
  } catch {
    res.json(DEFAULT_WORKSPACE);
  }
});

router.post("/workspace-state", (req, res) => {
  try {
    const patch = req.body as Partial<WorkspaceState>;
    const current = readDb();
    const next: WorkspaceState = {
      ...(current.workspaceState ?? DEFAULT_WORKSPACE),
      ...patch,
    };
    updateDb({ workspaceState: next });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save workspace state" });
  }
});

export default router;
