"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useCreateProject } from "@/hooks/useProjects";
import PromptInput from "@/components/editor/PromptInput";

export default function NewProjectPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const createProject = useCreateProject();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleSubmit = async (title: string, prompt: string) => {
    try {
      const project = await createProject.mutateAsync({ title, prompt });
      router.push(`/project/${project.id}`);
    } catch {
      // Error handled by useCreateProject
    }
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-heading mb-2">
            Describe Your Website
          </h1>
          <p className="text-[var(--text-secondary)]">
            Tell AI what you want in natural language. Be as specific as you like.
          </p>
        </div>

        <PromptInput
          onSubmit={handleSubmit}
          isLoading={createProject.isPending}
        />
      </main>
    </div>
  );
}
