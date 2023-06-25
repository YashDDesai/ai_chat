import db from "../utils/db";

import { Configuration, OpenAIApi } from "openai";
import { env } from "../config/env";

import { ChatCompletionResponseMessageRoleEnum } from "openai";

interface Ticket {
  id: number;
  isOpen: boolean;
  token: string;
}
interface Chat {
  id: string;
  ticketId: string;
  timestamp: Date;
  message: string;
  reply?: string | null;
  history?: Chat[];
  role?: ChatCompletionResponseMessageRoleEnum;
}

interface chatHistory {
  id: string;
  ticketId: string;
  timestamp: Date | string;
  message: string;
  role: string;
}

export const chatService = {
  async createChat(ticket: Ticket, message: string): Promise<chatHistory[]> {
    const timestamp = new Date();
    const fields = { ticketId: ticket.id, token: ticket.token, timestamp, message };

    await db.insert("chats", { ...fields, role: "user" });

    // Perform chat interaction with OpenAI
    const { reply, history, role } = await generateChatReply(message, ticket.token);

    const replyFields = {
      ticketId: ticket.id,
      token: ticket.token,
      timestamp,
      message: reply,
      role,
    };
    const latestChat = await db.insert("chats", replyFields);

    console.log({ latestChat });
    console.log({ history });

    // console.log({ ...{ id: latestChat.id, ...latestChat }, ...history });

    history.push(latestChat);
    // const chats = history.push(latestChat);

    console.log({ history2: history });
    return history;
  },

  async deleteOldChats() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    await db.deleteRows(
      "chats",
      "timestamp < ? AND ticketId IN (SELECT id FROM tickets WHERE isOpen = 0)",
      [cutoffDate]
    );
  },
};

async function generateChatReply(message: string, token: string) {
  const OPENAI_API_KEY = env.OPENAI_API_KEY;
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const ticketChats = await getTicketChats(token);
  const chatHistory = ticketChats.map((chat) => chat.message).join("\n");

  const prompt = `Ticket ID: ${token}\nChat History:\n${chatHistory}\nUser: ${message}\nAI:`;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return {
    reply: completion.data.choices[0]?.message?.content,
    history: ticketChats,
    role: completion.data.choices[0]?.message?.role,
  };
}

async function getTicketChats(token: string): Promise<chatHistory[]> {
  try {
    const results = await db.select("chats", "WHERE token = ?  ORDER BY id", [token]);
    return results as chatHistory[];
  } catch (error) {
    throw error;
  }
}
