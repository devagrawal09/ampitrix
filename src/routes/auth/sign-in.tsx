import { createSignal } from "solid-js";
import { signIn } from "aws-amplify/auth";
import { action, redirect, useAction } from "@solidjs/router";

const signInAction = action(
  async (data: { email: string; password: string }) => {
    const res = await signIn({
      password: data.password,
      username: data.email,
    });

    console.log({ res });

    if (res.isSignedIn) {
      throw redirect("/");
    }
  }
);

export default function SignInPage() {
  const [password, setPassword] = createSignal("");
  const [email, setEmail] = createSignal("");

  const signInFn = useAction(signInAction);

  return (
    <div class="flex justify-center items-center h-screen">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signInFn({ email: email(), password: password() });
        }}
        class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2" for="username">
            Email
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
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
            Sign In
          </button>
          <a
            class="text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            href="/auth/sign-up"
          >
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
}
