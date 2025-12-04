"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const { status } = useSession();

  // If logged in, redirect to home (or /tasks)
  if (status === "authenticated") {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-105px)] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl bg-white p-10 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Sign in to Continue
        </h1>

        <button
          onClick={() => signIn("google")}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:cursor-pointer hover:bg-blue-700"
        >
          {/* Google Icon */}
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
            fill="white"
          >
            <path d="M488 261.8C488 403.3 391.1 512 248 512 110.8 512 0 401.2 0 264S110.8 16 248 16c66.8 0 123.3 24.5 166.1 64.9l-67.3 64.1C321.4 109.7 288.2 96 248 96c-82.4 0-149.5 69.2-149.5 154S165.6 404 248 404c63.7 0 118-41.8 135.4-100.8H248v-80.5h240z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Only authorized accounts may access this application.
        </p>
      </div>
    </div>
  );
}
