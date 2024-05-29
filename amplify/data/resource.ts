import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
} from "@aws-amplify/backend";

export const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

export const generateCommentaryFunction = defineFunction({
  entry: "./generate-commentary.ts",
  timeoutSeconds: 60 * 2,
  environment: {
    MODEL_ID,
  },
});

const schema = a.schema({
  Player: a.customType({
    name: a.string().required(),
    userId: a.string().required(),
    opts: a.string().required().array().required(),
  }),

  ChatMessage: a.customType({
    role: a.enum(["user", "assistant"]),
    content: a.string().required(),
  }),

  Room: a
    .model({
      name: a.string().required(),
      status: a.enum(["LOBBY", "DRAFT", "MATCH", "FINISHED"]),
      players: a.ref("Player").required().array().required(),
      chat: a.ref("ChatMessage").required().array(),
    })
    .authorization((a) => [a.authenticated()]),

  commentate: a
    .query()
    .arguments({ messages: a.string() })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(generateCommentaryFunction)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
