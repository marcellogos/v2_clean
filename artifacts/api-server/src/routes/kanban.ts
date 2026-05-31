import { Router, type IRouter } from "express";
import { readDb, updateDb, type KCard } from "../lib/db";

const router: IRouter = Router();

const INITIAL_TASKS: KCard[] = [
  { id: "k1",  title: "Literature Review",            tag: "Research",     col: "todo"     },
  { id: "k2",  title: "Data Collection Plan",         tag: "Planning",     col: "todo"     },
  { id: "k3",  title: "Slide Structure Outline",      tag: "Design",       col: "todo"     },
  { id: "k4",  title: "Analyst Workshop",             tag: "Analysis",     col: "progress" },
  { id: "k5",  title: "Team Charter Finalization",    tag: "Operations",   col: "progress" },
  { id: "k6",  title: "Draft Review",                 tag: "Writing",      col: "review"   },
  { id: "k7",  title: "Financial Model Assumptions",  tag: "Finance",      col: "review"   },
  { id: "k8",  title: "Project Kickoff Meeting",      tag: "Planning",     col: "done"     },
  { id: "k9",  title: "Work Distribution Matrix",     tag: "Operations",   col: "done"     },
  { id: "k10", title: "Prof. Stratmann Presentation", tag: "Presentation", col: "done"     },
];

router.get("/kanban-tasks", (_req, res) => {
  try {
    const { kanbanTasks } = readDb();
    res.json(kanbanTasks ?? INITIAL_TASKS);
  } catch {
    res.json(INITIAL_TASKS);
  }
});

router.post("/kanban-tasks", (req, res) => {
  try {
    const tasks = req.body as KCard[];
    if (!Array.isArray(tasks)) {
      res.status(400).json({ error: "Body must be an array of tasks" });
      return;
    }
    updateDb({ kanbanTasks: tasks });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save kanban tasks" });
  }
});

export default router;
