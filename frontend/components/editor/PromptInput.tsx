"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

interface PromptInputProps {
  onSubmit: (prompt: string, title: string) => void;
  isLoading?: boolean;
}

const EXAMPLES = [
  "Build a SaaS landing page. Dark theme. Purple accent. Hero section. Pricing. Testimonials. FAQ. Contact. Responsive. Modern. Use glassmorphism.",
  "Create a modern portfolio website for a UI/UX designer. Dark theme, blue accent, About, Projects, Skills, Contact section.",
  "Design a restaurant website with warm colors. Menu, reservations, location, about the chef, and photo gallery.",
];

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const finalTitle = title.trim() || prompt.split(".")[0].slice(0, 50);
    onSubmit(finalTitle, prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Project title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg font-semibold"
        />
      </div>

      <div className="relative">
        <textarea
          placeholder="Describe the website you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className="w-full px-4 py-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none text-base leading-relaxed"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPrompt(ex)}
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-colors"
          >
            Example {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          disabled={!prompt.trim()}
        >
          <Sparkles size={18} className="mr-2" />
          Generate Website
        </Button>
      </div>
    </form>
  );
}
