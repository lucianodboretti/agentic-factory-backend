import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoutes from "./routes/chat";
import threadRoutes from "./routes/threads";
import messageRoutes from "./routes/messages";
import assistantRoutes from "./routes/assistants"; // 🆕

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/assistants", assistantRoutes); // 🆕

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
