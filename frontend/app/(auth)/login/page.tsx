"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles size={24} className="text-[var(--primary)]" />
            <span className="font-bold text-xl">AI Website Builder</span>
          </Link>
          <h1 className="text-2xl font-bold font-heading">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mt-1">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
