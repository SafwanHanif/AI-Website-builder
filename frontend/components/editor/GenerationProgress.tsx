"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import type { GenerationProgress as ProgressType } from "@/types";

const STEPS = [
  { key: "plan", label: "Planning website structure" },
  { key: "tokens", label: "Generating design tokens" },
  { key: "copy", label: "Writing copy" },
  { key: "components", label: "Creating components" },
  { key: "build", label: "Assembling project" },
];

export default function GenerationProgress() {
  const { generationProgress, isGenerating } = useProjectStore();

  const getStepStatus = (stepKey: string): "pending" | "active" | "complete" => {
    const stepEvents = generationProgress.filter((p) => p.step === stepKey || p.step === stepKey.replace("components", "component"));
    if (stepEvents.some((p) => p.status === "complete")) return "complete";
    if (stepEvents.some((p) => p.status === "started" || p.status === "in_progress")) return "active";
    // If a later step is active/complete, this one must have completed
    const stepIndex = STEPS.findIndex((s) => s.key === stepKey);
    const laterSteps = STEPS.slice(stepIndex + 1);
    for (const ls of laterSteps) {
      if (generationProgress.some((p) => (p.step === ls.key) && p.status === "complete")) {
        return "complete";
        }
    }
    return "pending";
  };

  if (!isGenerating && generationProgress.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto my-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[var(--primary)]" />
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          Generating your website...
        </h3>
      </div>

      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.key);
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                style={{
                  borderColor:
                    status === "complete" ? "var(--success)" :
                    status === "active" ? "var(--primary)" :
                    "var(--border)",
                  backgroundColor:
                    status === "complete" ? "var(--success)" :
                    "transparent",
                }}
              >
                {status === "complete" ? (
                  <Check size={12} className="text-white" />
                ) : status === "active" ? (
                  <Loader2 size={12} className="animate-spin text-[var(--primary)]" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                )}
              </div>
              <span className={`text-sm transition-colors ${
                status === "complete" ? "text-[var(--text-primary)]" :
                status === "active" ? "text-[var(--primary)]" :
                "text-[var(--text-secondary)]"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
