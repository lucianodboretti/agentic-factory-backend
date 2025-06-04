import { Router, Request, Response, RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { log } from "../lib/logger";

const router = Router();

// GET /api/assistants
router.get("/", async (_req: Request, res: Response) => {
  log({
    service: "assistants",
    event: "GetAllAssistantsRequest",
    message: "GET /api/assistants hit",
  });

  try {
    const assistants = await prisma.assistantPrompt.findMany({
      orderBy: { name: "asc" },
    });

    log({
      service: "assistants",
      event: "AssistantsFetched",
      message: "Successfully fetched assistant prompts",
      context: { count: assistants.length },
    });

    res.json(assistants);
  } catch (error) {
    log({
      level: "error",
      service: "assistants",
      event: "AssistantsFetchError",
      message: "Failed to fetch assistant prompts",
      context: { error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to fetch assistants" });
  }
});

// POST /api/assistants
router.post("/", async (req: Request, res: Response) => {
  log({
    service: "assistants",
    event: "UpsertAssistantRequest",
    message: "POST /api/assistants hit",
  });

  try {
    const { id, name, role, goal, tools, memory, format } = req.body;

    if (!id || !name) {
      log({
        level: "error",
        service: "assistants",
        event: "ValidationError",
        message: "Missing 'id' or 'name'",
        context: { body: req.body },
      });

      res.status(400).json({ error: "Missing 'id' or 'name'" });
      return;
    }

    const assistant = await prisma.assistantPrompt.upsert({
      where: { id },
      update: { name, role, goal, tools, memory, format },
      create: { id, name, role, goal, tools, memory, format },
    });

    log({
      service: "assistants",
      event: "AssistantUpserted",
      message: "Assistant prompt created or updated",
      context: { id, name },
    });

    res.status(200).json(assistant);
  } catch (error) {
    log({
      level: "error",
      service: "assistants",
      event: "UpsertError",
      message: "Unhandled exception during upsert",
      context: { error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to save assistant" });
  }
});

// GET /api/assistants/:id
const getAssistantById: RequestHandler<{ id: string }> = async (req, res) => {
  log({
    service: "assistants",
    event: "GetAssistantByIdRequest",
    message: "GET /api/assistants/:id hit",
    context: { id: req.params.id },
  });

  try {
    const assistant = await prisma.assistantPrompt.findUnique({
      where: { id: req.params.id },
    });

    if (!assistant) {
      log({
        service: "assistants",
        event: "AssistantNotFound",
        message: "No assistant found for given ID",
        context: { id: req.params.id },
      });

      res.status(404).json({ error: "Assistant not found" });
      return;
    }

    log({
      service: "assistants",
      event: "AssistantFetchedById",
      message: "Assistant successfully retrieved",
      context: { id: req.params.id },
    });

    res.json(assistant);
  } catch (error) {
    log({
      level: "error",
      service: "assistants",
      event: "FetchByIdError",
      message: "Error fetching assistant by ID",
      context: { id: req.params.id, error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to fetch assistant" });
  }
};

// PATCH /api/assistants/:id
const updateAssistant: RequestHandler<{ id: string }> = async (req, res) => {
  log({
    service: "assistants",
    event: "UpdateAssistantRequest",
    message: "PATCH /api/assistants/:id hit",
    context: { id: req.params.id },
  });

  try {
    const { name, role, goal, tools, memory, format } = req.body;

    const updated = await prisma.assistantPrompt.update({
      where: { id: req.params.id },
      data: { name, role, goal, tools, memory, format },
    });

    log({
      service: "assistants",
      event: "AssistantUpdated",
      message: "Assistant successfully updated",
      context: { id: req.params.id },
    });

    res.json(updated);
  } catch (error) {
    log({
      level: "error",
      service: "assistants",
      event: "UpdateError",
      message: "Error updating assistant",
      context: { id: req.params.id, error: (error as Error).message },
    });

    res.status(500).json({ error: "Failed to update assistant" });
  }
};

router.get("/:id", getAssistantById);
router.patch("/:id", updateAssistant);

export default router;
