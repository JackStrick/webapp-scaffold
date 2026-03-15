import type { RequestHandler } from "express";
import type { ZodType } from "zod";

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    for (const key of ["body", "query", "params"] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        res.status(400).json({ error: result.error.flatten() });
        return;
      }

      // Mutate with coerced/defaulted values so controllers receive clean data
      (req[key] as unknown) = result.data;
    }
    next();
  };
}
