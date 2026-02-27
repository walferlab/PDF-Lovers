import { createHash } from "node:crypto";

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "0.0.0.0";
  }

  return request.headers.get("x-real-ip") || "0.0.0.0";
}

export function hashVisitor({ ip, userAgent, salt }: { ip: string; userAgent: string; salt: string }) {
  return createHash("sha256").update(`${salt}:${ip}:${userAgent}`).digest("hex");
}
