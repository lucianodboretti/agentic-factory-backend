import { Router, Response, Request, RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { log } from "../lib/logger"; // 🆕 Add structured logger

const router = Router();

// GET /api/threads — list all threads
router.get("/", async (_req: Request, res: Response) => {
  log({
    service: "threads",
    event: "GetAllThreadsRequest",
    message: "GET /api/threads hit",
  });

  try {
    const threads = await prisma.thread.findMany({
      orderBy: { createdAt: "desc" },
    });

    log({
      service: "threads",
      event: "ThreadsFetched",
      message: "Successfully fetched threads",
      context: { count: threads.length },
    });

    res.json(threads);
  } catch (error) {
    log({
      level: "error",
      service: "threads",
      event: "ThreadsFetchError",
      message: "Failed to fetch threads",
      context: { error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to load threads" });
  }
});

// POST /api/threads — create new thread
router.post("/", async (req: Request, res: Response) => {
  log({
    service: "threads",
    event: "CreateThreadRequest",
    message: "POST /api/threads hit",
  });

  try {
    const { title } = req.body;
    const thread = await prisma.thread.create({
      data: { title: title || null },
    });

    log({
      service: "threads",
      event: "ThreadCreated",
      message: "New thread created",
      context: { id: thread.id },
    });

    res.status(201).json(thread);
  } catch (error) {
    log({
      level: "error",
      service: "threads",
      event: "ThreadCreateError",
      message: "Failed to create thread",
      context: { error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to create thread" });
  }
});

// GET /api/threads/:id — get thread by ID
const getThreadById: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  log({
    service: "threads",
    event: "GetThreadByIdRequest",
    message: "GET /api/threads/:id hit",
    context: { id },
  });

  try {
    const thread = await prisma.thread.findUnique({ where: { id } });

    if (!thread) {
      log({
        service: "threads",
        event: "ThreadNotFound",
        message: "Thread not found",
        context: { id },
      });

      res.status(404).json({ error: "Thread not found" });
      return;
    }

    log({
      service: "threads",
      event: "ThreadFetchedById",
      message: "Successfully fetched thread",
      context: { id },
    });

    res.json(thread);
  } catch (error) {
    log({
      level: "error",
      service: "threads",
      event: "ThreadFetchByIdError",
      message: "Failed to fetch thread by ID",
      context: { id, error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to fetch thread" });
  }
};

// PATCH /api/threads/:id — update thread title
const updateThreadTitle: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  log({
    service: "threads",
    event: "UpdateThreadTitleRequest",
    message: "PATCH /api/threads/:id hit",
    context: { id },
  });

  try {
    const { title } = req.body;

    const updated = await prisma.thread.update({
      where: { id },
      data: { title },
    });

    log({
      service: "threads",
      event: "ThreadTitleUpdated",
      message: "Thread title updated successfully",
      context: { id },
    });

    res.json(updated);
  } catch (error) {
    log({
      level: "error",
      service: "threads",
      event: "ThreadUpdateError",
      message: "Failed to update thread title",
      context: { id, error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to update thread" });
  }
};

router.get("/:id", getThreadById);
router.patch("/:id", updateThreadTitle);

export default router;
