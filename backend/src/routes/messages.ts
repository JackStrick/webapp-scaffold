import { Router } from "express";
import {
  createMessage,
  getAllMessages,
  getLatestMessages,
  getMessageById,
} from "../controllers/messageController";
import { validate } from "../middleware/validate";
import {
  GetLatestMessagesQuerySchema,
  GetMessagesQuerySchema,
  MessageParamsSchema,
} from "../schemas/message";

export const messageRouter = Router();

messageRouter.post("/", createMessage);
messageRouter.get("/latest", validate({ query: GetLatestMessagesQuerySchema }), getLatestMessages);
messageRouter.get("/", validate({ query: GetMessagesQuerySchema }), getAllMessages);
messageRouter.get("/:id", validate({ params: MessageParamsSchema }), getMessageById);
