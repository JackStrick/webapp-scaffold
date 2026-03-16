import { Router } from "express";
import { getContacts, getMe } from "../controllers/userController";
import { validate } from "../middleware/validate";
import { GetContactsQuerySchema } from "../schemas/user";

export const userRouter = Router();

userRouter.get("/me", getMe);
userRouter.get("/contacts", validate({ query: GetContactsQuerySchema }), getContacts);
