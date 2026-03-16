import { prisma } from "../db/prisma";
import type { MessageResponse } from "../types/message";

function toResponse(message: { id: string; content: string; createdAt: Date }): MessageResponse {
  return {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

export const messageService = {
  async createMessage(): Promise<MessageResponse> {
    const message = await prisma.message.create({
      data: { content: "Hello World" },
    });
    return toResponse(message);
  },

  async getAllMessages(skip: number, limit: number): Promise<MessageResponse[]> {
    const messages = await prisma.message.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return messages.map(toResponse);
  },

  async getLatestMessages(limit: number): Promise<MessageResponse[]> {
    const messages = await prisma.message.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return messages.map(toResponse);
  },

  async getMessageById(id: string): Promise<MessageResponse | null> {
    const message = await prisma.message.findUnique({ where: { id } });
    return message ? toResponse(message) : null;
  },
};
