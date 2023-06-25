import express from "express";
import { chatController } from "../controllers/chats.controllers";

export const chatRouter = express.Router();

chatRouter.post("/", chatController.createChat);
chatRouter.delete("/", chatController.deleteOldChats);
