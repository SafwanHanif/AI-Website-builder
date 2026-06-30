"use client";

import Link from "next/link";
import { Plus, FileCode } from "lucide-react";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function ProjectList() {
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Failed to load projects</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-4">
          <FileCode size={32} className="text-[var(--text-secondary)]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
          Describe the website you want in natural language, and AI will build it for you.
        </p>
        <Link href="/project/new">
          <Button size="lg">
            <Plus size={18} className="mr-2" />
            Create Your First Website
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Your Projects</h2>
        <Link href="/project/new">
          <Button>
            <Plus size={16} className="mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={(id) => deleteProject.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}
