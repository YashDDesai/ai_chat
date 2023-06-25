import { Request, Response } from "express";
import { ticketService } from "../services/ticket.service";

export const ticketController = {
  async createTicket(req: Request, res: Response) {
    try {
      const ticket = await ticketService.createTicket();
      res.json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async closeStaleTickets(req: Request, res: Response) {
    try {
      await ticketService.closeStaleTickets();
      res.json({ message: "Tickets closed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
