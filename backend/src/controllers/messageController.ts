import type { RequestHandler } from "express";
import {
  GetLatestMessagesQuerySchema,
  GetMessagesQuerySchema,
  MessageParamsSchema,
} from "../schemas/message";
import { messageService } from "../services/messageService";

export const createMessage: RequestHandler = async (_req, res, next) => {
  try {
    const message = await messageService.createMessage();
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

export const getAllMessages: RequestHandler = async (req, res, next) => {
  try {
    // validate middleware has already validated and coerced — parse is safe here
    const { skip, limit } = GetMessagesQuerySchema.parse(req.query);
    const messages = await messageService.getAllMessages(skip, limit);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const getLatestMessages: RequestHandler = async (req, res, next) => {
  try {
    const { limit } = GetLatestMessagesQuerySchema.parse(req.query);
    const messages = await messageService.getLatestMessages(limit);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const getMessageById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = MessageParamsSchema.parse(req.params);
    const message = await messageService.getMessageById(id);
    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json(message);
  } catch (err) {
    next(err);
  }
};
