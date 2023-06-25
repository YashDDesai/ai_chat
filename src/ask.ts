import { Configuration, OpenAIApi } from "openai";

const OPENAI_API_KEY = "";
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function ask() {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "who was the first indian president" }],
  });

  return completion.data.choices[0].message;
}

ask()
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
