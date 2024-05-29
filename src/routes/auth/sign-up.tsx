import { createSignal } from "solid-js";
import { signUp } from "aws-amplify/auth";
import { action, redirect } from "@solidjs/router";

const signUpAction = action(
  async (data: { email: string; password: string }) => {
    const res = await signUp({
      password: data.password,
      username: data.email,
      // options: { userAttributes: { email: data.email } },
    });

    console.log({ res });

    if (res.isSignUpComplete) {
      throw redirect("/");
    }

    if (res.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
      throw redirect(`/auth/verify?email=${data.email}`);
    }
  }
);

export default function SignUpPage() {
  const [password, setPassword] = createSignal("");
  const [email, setEmail] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await signUpAction({ email: email(), password: password() });
  };

  return (
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
            Sign Up
          </button>
          <a
            class="text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            href="/auth/sign-in"
          >
            Sign In
          </a>
        </div>
      </form>
    </div>
  );
}
