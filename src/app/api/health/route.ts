import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "error";
  }

  const duration = Date.now() - startTime;
  const isHealthy = dbStatus === "connected";

  return Response.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      database: dbStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      latencyMs: duration,
      environment: process.env.NODE_ENV || "development",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
