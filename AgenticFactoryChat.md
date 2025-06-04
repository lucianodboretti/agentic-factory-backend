# Agentic Factory Chat + Threads System

**Last Updated:** 2025-06-02

---

## 📦 Project Summary

You’ve built a complete local-first system with:

- ✅ A **Next.js frontend** with Tailwind CSS for UI
- ✅ An **Express backend** with Prisma for persistence
- ✅ OpenAI GPT-4 integration via streaming
- ✅ Fully working Chat UI with:
  - Live streaming replies
  - Chat history persistence
  - Editable thread titles
- ✅ Separate repos for `frontend/` and `backend/`
- ✅ Persistent Postgres container via Docker Compose

---

## 🛠️ Backend Setup

### ▶ `docker-compose.yml`

You defined a `postgres` container and volume, named:

```yaml
services:
  postgres:
    image: postgres:15
    container_name: agentic_factory_db
    environment:
      POSTGRES_USER: af_user
      POSTGRES_PASSWORD: af_pass
      POSTGRES_DB: agent_factory
    ports:
      - "5432:5432"
    volumes:
      - agent_factory_pgdata:/var/lib/postgresql/data
volumes:
  agent_factory_pgdata:
```

### ▶ Prisma Models

You use two models:

```
model Thread {
  id        String    @id @default(uuid())
  title     String?
  createdAt DateTime  @default(now())
  messages  Message[]
}

model Message {
  id        String   @id @default(uuid())
  threadId  String
  role      String
  name      String
  content   String
  createdAt DateTime @default(now())

  thread Thread @relation(fields: [threadId], references: [id])
}
```

### ▶ Express Routes

**Mounted in `index.ts`:**

```ts
app.use("/api/threads", threadRoutes);
app.use("/api/chat", chatRoutes);
```

**Route features:**

- `GET /api/threads` – List all threads
- `POST /api/threads` – Create new thread
- `GET /api/threads/:id` – Fetch thread by ID
- `PATCH /api/threads/:id` – Update thread title
- `POST /api/chat` – Stream OpenAI response, save user & assistant messages

All routes use proper `express.Router()` structure and avoid handler misusage.

---

## 💬 Frontend Setup

### ✅ Chat UI (`ChatPanel.tsx`)

- Fully styled with Tailwind
- Scrolls to bottom on message append
- Streams OpenAI response chunk by chunk
- Handles editable title inside component (via `PATCH /api/threads/:id`)

### ✅ Chat Routing

Dynamic chat page mounted under `/chat/[thread_id]`:

```tsx
export default function ChatPage() {
  const { thread_id } = useParams();
  return <ChatPanel threadId={thread_id as string} />;
}
```

### ✅ Projects Page (`/projects`)

- Loads thread list from `/api/threads`
- “New Project” button creates thread and navigates to `/chat/:id`
- Displays thread title and creation time

### 🔧 Troubleshooting Covered

- CORS setup via `app.use(cors())`
- `.env` setup with `NEXT_PUBLIC_BACKEND_URL`
- Docker volume persistence
- Avoiding `router.post(...)` misuse in `app.use(...)`
- TypeScript overload errors on `RequestHandler`

---

## ✅ Features Working

| Feature                         | Status |
|----------------------------------|--------|
| Editable thread titles           | ✅     |
| Thread persistence in DB         | ✅     |
| Streaming chat with OpenAI       | ✅     |
| Saving both user + assistant msg | Not Working     |
| Project list refresh             | Not Working     |
| Type-safe routes (TS)            | ✅     |

---

## 📎 Next Steps (Optional)

- Add message loading in `ChatPanel` from `/api/messages/:threadId`
- Add delete thread support (`DELETE /api/threads/:id`)
- Add zod validation on inputs
- Use SWR or React Query for better cache syncing
