import type { RequestHandler } from "express";
import { GetContactsQuerySchema } from "../schemas/user";
import { userService } from "../services/userService";

export const getMe: RequestHandler = async (_req, res, next) => {
  try {
    const user = await userService.getActorUser();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getContacts: RequestHandler = async (req, res, next) => {
  try {
    const { skip, limit } = GetContactsQuerySchema.parse(req.query);
    const contacts = await userService.getContacts(skip, limit);
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};
