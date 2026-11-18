import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import { type Observable, tap } from "rxjs";
import { type TraceableRequest, type TraceableResponse, resolveRequestId } from "./request-id.js";

export interface AccessLogEntry {
  timestamp: string;
  level: "info" | "error";
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userId: string | null;
}

export type LogSink = (entry: AccessLogEntry) => void;

const defaultStdoutSink: LogSink = (entry) => {
  process.stdout.write(`${JSON.stringify(entry)}\n`);
};

@Injectable()
export class StructuredLoggerInterceptor implements NestInterceptor {
  constructor(private readonly sink: LogSink = defaultStdoutSink) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<TraceableRequest>();
    const res = http.getResponse<TraceableResponse>();

    const requestId = resolveRequestId(req, res);
    const startedAt = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.emit(req, requestId, res.statusCode ?? 200, startedAt, "info");
        },
        error: () => {
          this.emit(req, requestId, res.statusCode ?? 500, startedAt, "error");
        },
      }),
    );
  }

  private emit(
    req: TraceableRequest,
    requestId: string,
    statusCode: number,
    startedAt: number,
    level: "info" | "error",
  ): void {
    this.sink({
      timestamp: new Date().toISOString(),
      level,
      requestId,
      method: req.method ?? "UNKNOWN",
      path: req.url ?? "/",
      statusCode,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      userId: req.user?.id ?? null,
    });
  }
}
