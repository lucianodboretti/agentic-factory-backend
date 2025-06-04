const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

type LogLevel = keyof typeof levels;

const envLevel = (process.env.LOG_LEVEL?.toLowerCase() ?? "info") as LogLevel;
const minLevel = levels[envLevel] ?? levels["info"];

export function log({
  level = "info",
  service = "default",
  event,
  message,
  context = {},
}: {
  level?: LogLevel;
  service?: string;
  event: string;
  message: string;
  context?: Record<string, any>;
}) {
  if (levels[level] < minLevel) return;

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service,
      event,
      message,
      context,
    })
  );
}
