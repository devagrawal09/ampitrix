import { createSignal } from "solid-js";
import { confirmSignUp } from "aws-amplify/auth";
import { action, redirect, useSearchParams } from "@solidjs/router";

const verifyAction = action(async (data: { email?: string; otp: string }) => {
  if (!data.email) throw redirect("/sign-up");

  const res = await confirmSignUp({
    username: data.email,
    confirmationCode: data.otp,
  });

  console.log({ res });

  if (res.isSignUpComplete) {
    throw redirect("/");
  }
});

export default function VerifyPage() {
  const [params] = useSearchParams<{ email: string }>();
  const [otp, setOtp] = createSignal("");

  return (
    <div class="flex justify-center items-center h-screen">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await verifyAction({ otp: otp(), email: params.email });
        }}
        class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <div class="mb-6">
          <label class="block text-gray-700 font-bold mb-2" for="otp">
            OTP
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="otp"
            type="text"
            placeholder="Enter the OTP sent to your email"
            value={otp()}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
        <div class="flex items-center justify-between">
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Verify
          </button>
          <a href="/sign-up">Cancel</a>
        </div>
      </form>
    </div>
  );
}
