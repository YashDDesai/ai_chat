import db from "../utils/db";
import { v4 as uuid } from "uuid";

interface Ticket {
  id: number;
  isOpen: boolean;
  token: string;
}

export const ticketService = {
  async createTicket(): Promise<Ticket> {
    const token = uuid();
    const fields = { isOpen: true, token };
    const ticket = await db.insert("tickets", fields);
    return ticket;
  },

  async getTicketByToken(token: string): Promise<Ticket> {
    const ticket = await db.selectOne<Ticket>("tickets", "where token=?", [token]);
    return ticket;
  },
  async getTicketById(ticketId: number): Promise<Ticket> {
    const ticket = await db.selectOne<Ticket>("tickets", "where id=? and isOpen=1", [ticketId]);
    return ticket;
  },

  async closeStaleTickets() {
    const dateOfExpire = new Date();
    dateOfExpire.setDate(dateOfExpire.getDate() - 14);
    // await db.transaction(async (connection) => {
    await db.update(
      "tickets",
      { isOpen: 0 },
      "id NOT IN (SELECT ticketId FROM chats WHERE timestamp >= ?)",
      [dateOfExpire]
    );
    // });

    // await db.transaction([])
  },
};
