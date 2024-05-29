import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data, MODEL_ID, generateCommentaryFunction } from "./data/resource";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const backend = defineBackend({
  auth,
  data,
  generateCommentaryFunction,
});

backend.generateCommentaryFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [`arn:aws:bedrock:*::foundation-model/${MODEL_ID}`],
  })
);
