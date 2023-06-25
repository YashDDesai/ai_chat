import { config } from "dotenv";

config();

export const env = Object.freeze({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
});
