import { z } from "zod";

export const GetContactsQuerySchema = z.object({
  skip: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type GetContactsQuery = z.infer<typeof GetContactsQuerySchema>;
