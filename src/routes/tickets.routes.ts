import express from "express";
import { ticketController } from "../controllers/ticket.controllers";

export const ticketRouter = express.Router();

ticketRouter.post("/", ticketController.createTicket);
ticketRouter.patch("/", ticketController.closeStaleTickets);
