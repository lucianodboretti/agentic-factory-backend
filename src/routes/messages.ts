import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { log } from "../lib/logger"; // ✅ Use the same logger

const router = Router();

router.get("/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;

  log({
    service: "messages",
    event: "GetMessagesRequest",
    message: "GET /api/messages/:threadId hit",
    context: { threadId },
  });

  try {
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });

    log({
      service: "messages",
      event: "MessagesFetched",
      message: "Successfully retrieved messages for thread",
      context: { threadId, count: messages.length },
    });

    res.json(messages);
  } catch (error) {
    log({
      level: "error",
      service: "messages",
      event: "FetchMessagesError",
      message: "Failed to fetch messages",
      context: { threadId, error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
