import type { PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";
import { DomainException } from "../filters/domain-exception.filter.js";

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
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
