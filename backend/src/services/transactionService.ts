import type { Transaction, User } from "@prisma/client";
import { prisma } from "../db/prisma";
import type { TransactionResponse } from "../types/transaction";

type TransactionWithUsers = Transaction & {
  sender: Pick<User, "name" | "handle">;
  recipient: Pick<User, "name" | "handle">;
};

function toResponse(tx: TransactionWithUsers): TransactionResponse {
  return {
    id: tx.id,
    senderId: tx.senderId,
    senderName: tx.sender.name,
    senderHandle: tx.sender.handle,
    recipientId: tx.recipientId,
    recipientName: tx.recipient.name,
    recipientHandle: tx.recipient.handle,
    amountCents: tx.amountCents,
    memo: tx.memo,
    createdAt: tx.createdAt.toISOString(),
  };
}

const userInclude = { select: { name: true, handle: true } } as const;

export const transactionService = {
  async createTransaction(
    senderId: string,
    recipientId: string,
    amountCents: number,
    memo?: string,
  ): Promise<TransactionResponse> {
    if (senderId === recipientId) {
      throw Object.assign(new Error("Cannot send money to yourself"), { status: 400 });
    }

    return await prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: senderId, balanceCents: { gte: amountCents } },
        data: { balanceCents: { decrement: amountCents } },
      });

      if (result.count === 0) {
        throw Object.assign(new Error("Insufficient funds"), { status: 409 });
      }

      await tx.user.update({
        where: { id: recipientId },
        data: { balanceCents: { increment: amountCents } },
      });

      const transaction = await tx.transaction.create({
        data: { senderId, recipientId, amountCents, memo },
        include: { sender: userInclude, recipient: userInclude },
      });

      return toResponse(transaction);
    });
  },

  async getTransactions(
    actorId: string,
    skip: number,
    limit: number,
    direction: "all" | "sent" | "received",
  ): Promise<TransactionResponse[]> {
    const where =
      direction === "sent"
        ? { senderId: actorId }
        : direction === "received"
          ? { recipientId: actorId }
          : { OR: [{ senderId: actorId }, { recipientId: actorId }] };

    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { sender: userInclude, recipient: userInclude },
    });

    return transactions.map(toResponse);
  },
};
