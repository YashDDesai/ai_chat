import express, { Request, Response } from "express";
import mysql, { OkPacket } from "mysql2/promise";
import { Configuration, OpenAIApi } from "openai";
import { env } from "./config/env";

//OpenAI configuration
const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "your-hostname",
  user: "your-username",
  password: "your-password",
  database: "your-database",
  connectionLimit: 10,
});

const app = express();
app.use(express.json());

// API to create a new conversation thread and add participants
app.post("/api/threads", async (req: Request, res: Response) => {
  try {
    const { participants } = req.body;

    // Create a new thread
    const [result] = (await pool.execute("INSERT INTO thread () VALUES ()")) as OkPacket[];
    const threadId = result.insertId;

    // Add participants to the thread
    for (const participantId of participants) {
      await pool.execute(
        "INSERT INTO participants (thread_threadId, user_userId) VALUES (?, ?)",
        [threadId, participantId]
      );
    }

    res.status(201).json({ threadId });
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ error: "An error occurred while creating the thread." });
  }
});

// API to send a message in a conversation
app.post("/api/messages", async (req: Request, res: Response) => {
  try {
    const { threadId, userId, body } = req.body;

    // Save the message
    const [result] = (await pool.execute(
      "INSERT INTO message (sendDate, body, thread_threadId, user_userId, chatGPT_userId) VALUES (NOW(), ?, ?, ?, NULL)",
      [body, threadId, userId]
    )) as OkPacket[];
    const messageId = result.insertId;

    // Generate response from Model (ex. chatGPT)
    const responseFromModel = await generateResponseFromModel(body);

    // Save the response from chatGPT
    const [responseResult] = (await pool.execute(
      "INSERT INTO message (sendDate, body, thread_threadId, user_userId, chatGPT_userId) VALUES (NOW(), ?, ?, NULL, ?)",
      [responseFromModel, threadId, userId]
    )) as OkPacket[];
    const responseMessageId = responseResult.insertId;

    res.status(201).json({ messageId, responseMessageId });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "An error occurred while sending the message." });
  }
});

// Custom function to generate a response from the Model (e.g., chatGPT)
async function generateResponseFromModel(message: string) {
  try {
    // Generate a response from the OpenAI model
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello world" }],
    });

    // Extract the generated response from the API response
    const generatedResponse = chatCompletion.data.choices[0].message;

    return generatedResponse;
  } catch (error) {
    console.error("Error generating response from OpenAI:", error);
    throw new Error("An error occurred while generating the response.");
  }
}

// API to retrieve messages in a conversation thread
app.get("/api/messages/:threadId", async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;

    // Get the messages in the thread
    const messages = await getMessagesInThread(parseInt(threadId));

    res.json({ messages });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "An error occurred while retrieving the messages." });
  }
});

// Custom function to get messages in a conversation thread
async function getMessagesInThread(threadId: number) {
  const [rows] = await pool.execute(
    "SELECT message.messageId, message.sendDate, message.body, user.userId FROM message " +
      "JOIN user ON message.user_userId = user.userId " +
      "WHERE message.thread_threadId = ?",
    [threadId]
  );

  return rows;
}

// Backend trigger to delete chats older than a week for closed tickets
async function deleteChatsOlderThanWeek() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7); // Set cutoff date to a week ago

  await pool.execute("DELETE FROM message WHERE sendDate < ? AND chatGPT_userId IS NOT NULL", [
    cutoffDate,
  ]);
}

// Backend trigger to close tickets with no chats for two weeks
async function closeTicketsWithNoChats() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 14); // Set cutoff date to two weeks ago

  await pool.execute(
    "UPDATE thread SET closed = 1 WHERE threadId NOT IN " +
      "(SELECT thread_threadId FROM message WHERE sendDate >= ?)",
    [cutoffDate]
  );
}

// Set up periodic triggers
setInterval(deleteChatsOlderThanWeek, 24 * 60 * 60 * 1000); // Run once a day
setInterval(closeTicketsWithNoChats, 24 * 60 * 60 * 1000); // Run once a day

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
