import { z } from "zod";

export const CreateTransactionBodySchema = z.object({
  recipientId: z.string().uuid({ message: "Invalid recipient ID" }),
  amountCents: z.number().int().positive({ message: "Amount must be a positive integer (in cents)" }),
  memo: z.string().max(255).optional(),
});

export const GetTransactionsQuerySchema = z.object({
  skip: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(100).default(50),
  direction: z.enum(["all", "sent", "received"]).default("all"),
});

export type CreateTransactionBody = z.infer<typeof CreateTransactionBodySchema>;
export type GetTransactionsQuery = z.infer<typeof GetTransactionsQuerySchema>;
