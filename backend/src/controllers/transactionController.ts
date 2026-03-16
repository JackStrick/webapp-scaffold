import type { RequestHandler } from "express";
import { CreateTransactionBodySchema, GetTransactionsQuerySchema } from "../schemas/transaction";
import { transactionService } from "../services/transactionService";
import { userService } from "../services/userService";

export const createTransaction: RequestHandler = async (req, res, next) => {
  try {
    const { recipientId, amountCents, memo } = CreateTransactionBodySchema.parse(req.body);
    const actorId = await userService.getActorId();
    const transaction = await transactionService.createTransaction(actorId, recipientId, amountCents, memo);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

export const getTransactions: RequestHandler = async (req, res, next) => {
  try {
    const { skip, limit, direction } = GetTransactionsQuerySchema.parse(req.query);
    const actorId = await userService.getActorId();
    const transactions = await transactionService.getTransactions(actorId, skip, limit, direction);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};
