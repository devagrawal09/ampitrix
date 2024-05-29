import type { Schema } from "./resource";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

// initialize bedrock runtime client
const client = new BedrockRuntimeClient();

export type Messages = NonNullable<Schema["Room"]["type"]["chat"]>;

export const handler: Schema["commentate"]["functionHandler"] = async (
  event,
  context
) => {
  console.log({ event });
  // User prompt
  if (!event.arguments.messages) throw new Error("No messages provided");
  const messages: Messages = JSON.parse(event.arguments.messages);

  // Invoke model
  const input = {
    modelId: process.env.MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      system:
        "You are a commentator for an Age of Empires 2 Definitive Edition event. Two players will begin the event by drafting from the civilizations available in the game, followed by a set of 5 games. Your job is to provide expert and engaging commentary for the draft and game decisions. You will be told what each draft selection pick is, and you have to talk about why a player might pick that civilization, what the strengths and weaknesses of that civilization are, how this selection could counter any civilizations drafted by it's opponent, and how the opponent could counter this selection. Once the games start, you need to provide expert and engaging commentary on the results of the game as described to you by the host, and talk about the remaining civilizations in the draft by both players.",
      messages,
      max_tokens: 1000,
      temperature: 0.5,
    }),
  } as InvokeModelCommandInput;

  const command = new InvokeModelCommand(input);
  try {
    console.log({ command });
    const response = await client.send(command);

    // Parse the response and return the generated haiku
    const data = JSON.parse(Buffer.from(response.body).toString());
    console.log({ data });
    return JSON.stringify(data);
  } catch (err) {
    console.error(err);
    return `Failed`;
  }
};
