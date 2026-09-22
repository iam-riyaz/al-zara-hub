export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  requestId?: string;
  userId?: string;
  method?: string;
  route?: string;
  status?: number;
  durationMs?: number;
  context?: Record<string, unknown>;
  error?: unknown;
}

// Strip sensitive fields
function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ["password", "passwordHash", "token", "jwt", "secret", "cvv", "creditCard"];
  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      clean[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      clean[key] = sanitize(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const logger = {
  info(payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = payload.context ? sanitize(payload.context) : undefined;
    console.log(
      JSON.stringify({
        level: "info",
        timestamp,
        ...payload,
        context: sanitizedContext,
      })
    );
  },

  warn(payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = payload.context ? sanitize(payload.context) : undefined;
    console.warn(
      JSON.stringify({
        level: "warn",
        timestamp,
        ...payload,
        context: sanitizedContext,
      })
    );
  },

  error(payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const errObj =
      payload.error instanceof Error
        ? { message: payload.error.message, stack: payload.error.stack }
        : payload.error;
    const sanitizedContext = payload.context ? sanitize(payload.context) : undefined;

    console.error(
      JSON.stringify({
        level: "error",
        timestamp,
        ...payload,
        context: sanitizedContext,
        error: errObj,
      })
    );
  },
};
