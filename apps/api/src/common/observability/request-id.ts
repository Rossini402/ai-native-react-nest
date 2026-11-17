import { randomUUID } from "node:crypto";
import { REQUEST_ID_HEADER } from "@repo/contracts";

const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export interface TraceableRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
  user?: { id: string };
}

export interface TraceableResponse {
  statusCode?: number;
  setHeader(name: string, value: string): unknown;
}

export function resolveRequestId(req: TraceableRequest, res?: TraceableResponse): string {
  if (req.requestId && SAFE_REQUEST_ID_PATTERN.test(req.requestId)) {
    res?.setHeader(REQUEST_ID_HEADER, req.requestId);
    return req.requestId;
  }

  const rawHeader = req.headers[REQUEST_ID_HEADER];
  const candidate = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  const resolved =
    candidate && SAFE_REQUEST_ID_PATTERN.test(candidate) ? candidate : randomUUID();

  req.requestId = resolved;
  res?.setHeader(REQUEST_ID_HEADER, resolved);
  return resolved;
}
