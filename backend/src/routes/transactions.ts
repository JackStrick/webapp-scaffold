import { Router } from "express";
import { createTransaction, getTransactions } from "../controllers/transactionController";
import { validate } from "../middleware/validate";
import { CreateTransactionBodySchema, GetTransactionsQuerySchema } from "../schemas/transaction";

export const transactionRouter = Router();

transactionRouter.post("/", validate({ body: CreateTransactionBodySchema }), createTransaction);
transactionRouter.get("/", validate({ query: GetTransactionsQuerySchema }), getTransactions);
