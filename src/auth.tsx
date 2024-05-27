import { createAsync } from "@solidjs/router";
import { getCurrentUser, signIn, signUp } from "aws-amplify/auth";
import { Show, createEffect } from "solid-js";

export function createAuth() {
  const auth = createAsync(() => getCurrentUser());

  createEffect(() => console.log(`auth`, auth()));

  return <div>Auth</div>;
}

import { createSignal } from "solid-js";

export const Authenticator = () => {
  const [formMode, setFormMode] = createSignal<"signin" | "signup" | "verify">(
    "signin"
  );
  const [password, setPassword] = createSignal("");
  const [email, setEmail] = createSignal("");

  const toggleFormMode = () => {
    setFormMode(formMode() === "signin" ? "signup" : "signin");
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (formMode() === "signin") {
      const res = await signIn({
        password: password(),
        username: email(),
      });
      console.log({ res });
      // Redirect to the authenticated user's dashboard or home page
    } else {
      const res = await signUp({
        password: password(),
        username: email(),
        options: { userAttributes: { email: email() } },
      });
      console.log({ res });
      // Redirect to the sign-in page or user's dashboard
    }
  };

  return (
    <>
      <Show when={formMode() === "verify"}>
        <div>Verify</div>
      </Show>
      <div class="flex justify-center items-center h-screen">
        <form
          onSubmit={handleSubmit}
          class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
        >
          <div class="mb-6">
            <label class="block text-gray-700 font-bold mb-2" for="email">
              Email
            </label>
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email()}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 font-bold mb-2" for="password">
              Password
            </label>
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password()}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div class="flex items-center justify-between">
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {formMode() === "signin" ? "Sign In" : "Sign Up"}
            </button>
            <button
              class="text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={toggleFormMode}
            >
              {formMode() === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
