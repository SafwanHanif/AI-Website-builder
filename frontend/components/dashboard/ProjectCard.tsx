"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const updatedDate = new Date(project.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--primary)] transition-all duration-300"
    >
      <Link href={`/project/${project.id}`} className="block p-5">
        {/* Preview Thumbnail placeholder */}
        <div className="h-32 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-purple-500/20 mb-4 flex items-center justify-center">
          <span className="text-3xl">🌐</span>
        </div>

        <h3 className="font-semibold text-lg text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
          {project.title}
        </h3>

        {project.description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Clock size={12} />
          <span>{updatedDate}</span>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id);
        }}
        className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--surface)]/80 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 transition-all duration-200"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
