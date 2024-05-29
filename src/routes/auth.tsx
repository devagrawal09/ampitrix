import { RouteDefinition, cache, redirect } from "@solidjs/router";
import { getCurrentUser } from "aws-amplify/auth";
import { type JSX } from "solid-js";

export const route = {
  load() {
    currentUserCache();
  },
} satisfies RouteDefinition;

const currentUserCache = cache(async () => {
  try {
    const user = await getCurrentUser();
    if (user) throw redirect("/");
  } catch (err) {
    console.log(err);
  }
}, "user");

export default function AuthLayout(props: { children: JSX.Element }) {
  return <>{props.children}</>;
}
