import express from "express";
import { ticketRouter } from "./routes/tickets.routes";
import { chatRouter } from "./routes/chats.routes";

const app = express();

app.use(express.json());

app.use("/tickets", ticketRouter);
app.use("/chats", chatRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
