"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

interface AIEditInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export default function AIEditInput({ onSubmit, isLoading }: AIEditInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt);
    setPrompt("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Edit with AI — e.g., 'Make buttons rounded' or 'Use green instead of blue'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
        />
      </div>
      <Button
        type="submit"
        size="md"
        isLoading={isLoading}
        disabled={!prompt.trim()}
      >
        {isLoading ? (
          <Sparkles size={16} />
        ) : (
          <Send size={16} />
        )}
      </Button>
    </form>
  );
}
