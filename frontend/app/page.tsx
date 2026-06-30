"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Eye, Download, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

const features = [
  {
    icon: Sparkles,
    title: "Natural Language Prompts",
    desc: "Describe your website in plain English. AI handles the rest.",
  },
  {
    icon: Eye,
    title: "Live Preview",
    desc: "See your website come to life instantly. Iterate in real-time.",
  },
  {
    icon: Zap,
    title: "AI Editing",
    desc: "Make changes with natural language. 'Make it darker' just works.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    desc: "Download as a complete React project. Deploy anywhere.",
  },
];

export default function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles size={24} className="text-[var(--primary)]" />
          <span className="font-bold text-lg">AI Website Builder</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold font-heading leading-tight mb-6"
        >
          Describe.{" "}
          <span className="text-[var(--primary)]">Generate.</span>{" "}
          Deploy.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto"
        >
          Tell AI what kind of website you want in natural language. It plans,
          designs, writes copy, and generates production-ready React code.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href={isAuthenticated ? "/project/new" : "/signup"}>
            <Button size="lg">
              <Sparkles size={18} className="mr-2" />
              {isAuthenticated ? "Create a Website" : "Start Building — Free"}
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-[var(--text-secondary)]">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold font-heading mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["1. Describe", "2. AI Plans", "3. Preview", "4. Export"].map(
            (step, i) => (
              <div key={step} className="relative">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  {i + 1}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{step}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--border)]">
        AI Website Builder — Built with Next.js + FastAPI + Gemini
      </footer>
    </div>
  );
}
