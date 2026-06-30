"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles size={24} className="text-[var(--primary)]" />
            <span className="font-bold text-xl">AI Website Builder</span>
          </Link>
          <h1 className="text-2xl font-bold font-heading">Get started</h1>
          <p className="text-[var(--text-secondary)] mt-1">Create your account</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <SignUpForm />
        </div>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
