import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { ApiErrorEnvelope, ErrorCode } from "@repo/contracts";
import {
  resolveRequestId,
  type TraceableRequest,
  type TraceableResponse,
} from "../observability/request-id.js";

export class DomainException extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = HttpStatus.BAD_REQUEST,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = "DomainException";
  }
}

interface JsonErrorResponse extends TraceableResponse {
  status(code: number): JsonErrorResponse;
  json(body: ApiErrorEnvelope): void;
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<TraceableRequest>();
    const response = http.getResponse<JsonErrorResponse>();
    const requestId = resolveRequestId(request, response);

    if (exception instanceof DomainException) {
      response.status(exception.statusCode).json({
        ok: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
          requestId,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: exception.message,
          requestId,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected internal server error",
        requestId,
      },
    });
  }
}
