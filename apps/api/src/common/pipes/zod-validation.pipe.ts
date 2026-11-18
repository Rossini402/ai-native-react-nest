import type { PipeTransform } from "@nestjs/common";
import type { ZodType, ZodTypeDef } from "zod";
import { DomainException } from "../filters/domain-exception.filter.js";

export class ZodValidationPipe<TOutput, TInput = unknown>
  implements PipeTransform<unknown, TOutput>
{
  constructor(private readonly schema: ZodType<TOutput, ZodTypeDef, TInput>) {}

  transform(value: unknown): TOutput {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      const details = parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "body"}: ${issue.message}`,
      );
      throw new DomainException("VALIDATION_ERROR", "Request validation failed", 400, details);
    }
    return parsed.data;
  }
}
