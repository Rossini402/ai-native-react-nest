import { describe, expect, it } from "vitest";
import { resolveRequestId, type TraceableRequest } from "./request-id.js";
import type { AccessLogEntry } from "./structured-logger.interceptor.js";

describe("Observability Request Correlation", () => {
  it("propagates safe client x-request-id values and mirrors onto response header", () => {
    const headersSet = new Map<string, string>();
    const req: TraceableRequest = {
      headers: { "x-request-id": "client-trace-001" },
    };
    const id = resolveRequestId(req, {
      setHeader: (k, v) => headersSet.set(k, v),
    });

    expect(id).toBe("client-trace-001");
    expect(headersSet.get("x-request-id")).toBe("client-trace-001");
  });

  it("rejects newline/log-injection x-request-id headers and generates a clean UUID", () => {
    const req: TraceableRequest = {
      headers: { "x-request-id": "bad\n{\"injected\":true}" },
    };
    const id = resolveRequestId(req);

    expect(id).not.toContain("\n");
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("produces serializable AccessLogEntry shape", () => {
    const sample: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      requestId: "req-123",
      method: "GET",
      path: "/api/tasks",
      statusCode: 200,
      durationMs: 4.25,
      userId: "u-1",
    };
    expect(() => JSON.stringify(sample)).not.toThrow();
  });
});
