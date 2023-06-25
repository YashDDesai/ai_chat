import { Request, Response } from "express";
import { ticketService } from "../services/ticket.service";
import { chatService } from "../services/chat.services";

export const chatController = {
  async createChat(req: Request, res: Response) {
    const { token, message } = req.body;

    if (!token || !message) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    try {
      let ticket = await ticketService.getTicketByToken(token);

      if (!ticket) {
        ticket = await ticketService.createTicket();
      }

      const chat = await chatService.createChat(ticket, message);

      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async deleteOldChats(req: Request, res: Response) {
    try {
      await chatService.deleteOldChats();
      res.json({ message: "Chats deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
