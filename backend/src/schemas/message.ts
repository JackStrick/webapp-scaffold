import { z } from "zod";

export const GetMessagesQuerySchema = z.object({
  skip: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(100).default(100),
});

export const GetLatestMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const MessageParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid message ID" }),
});

export type GetMessagesQuery = z.infer<typeof GetMessagesQuerySchema>;
export type GetLatestMessagesQuery = z.infer<typeof GetLatestMessagesQuerySchema>;
export type MessageParams = z.infer<typeof MessageParamsSchema>;
