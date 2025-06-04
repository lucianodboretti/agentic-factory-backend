import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { log } from "../lib/logger";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post("/", async (req: Request, res: Response): Promise<void> => {
  log({ service: "chat", event: "ChatRequest", message: "POST /api/chat hit" });

  try {
    const { message, history = [], threadId, assistantId } = req.body;

    if (!message || !threadId || !assistantId) {
      res.status(400).json({ error: "Missing message, threadId, or assistantId" });
      return;
    }

    const assistant = await prisma.assistantPrompt.findUnique({ where: { id: assistantId } });
    if (!assistant) {
      res.status(404).json({ error: "Assistant not found" });
      return;
    }

    // Save user message
    await prisma.message.create({
      data: {
        threadId,
        role: "user",
        name: "User",
        content: message,
        assistantId,
      },
    });

    log({
      service: "chat",
      event: "UserMessageSaved",
      message: "User message stored",
      context: { threadId, assistantId },
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = buildPrompt(assistant);
    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: fullMessages,
      stream: true,
    });

    let assistantContent = "";

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        assistantContent += token;
        res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

    await prisma.message.create({
      data: {
        threadId,
        role: "assistant",
        name: assistant.name || "Agent",
        content: assistantContent,
        assistantId,
      },
    });

    log({
      service: "chat",
      event: "AssistantMessageSaved",
      message: "Assistant response saved",
      context: { threadId, assistantId },
    });
  } catch (error) {
    log({
      level: "error",
      service: "chat",
      event: "ChatError",
      message: "Unhandled error",
      context: { error: (error as Error).message },
    });

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

function buildPrompt(a: any): string {
  let prompt = a.role || "You are a helpful assistant.";
  if (a.goal) prompt += `\n\nYour task is to help the user ${a.goal}.`;
  if (a.tools?.length) prompt += `\n\nYou may call tools: ${a.tools.join(", ")}.`;
  if (a.memory?.length) prompt += `\n\nYou remember:\n${a.memory.map((m: string) => `- ${m}`).join("\n")}`;
  if (a.format === "markdown") prompt += `\n\nRespond in markdown format using concise, structured sections.`;
  else if (a.format === "json") prompt += `\n\nRespond in valid JSON format.`;
  return prompt.trim();
}

export default router;
