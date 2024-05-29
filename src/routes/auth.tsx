import { cache, redirect } from "@solidjs/router";
import { getCurrentUser } from "aws-amplify/auth";
import { type JSX, createEffect } from "solid-js";

const currentUserCache = cache(async () => {
  try {
    const user = await getCurrentUser();
    if (user) throw redirect("/");
  } catch (err) {
    console.log(err);
  }
}, "user");

export default function AuthLayout(props: { children: JSX.Element }) {
  createEffect(() => console.log(`user`, currentUserCache()));

  return <>{props.children}</>;
}
