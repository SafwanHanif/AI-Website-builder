"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  History,
  Sparkles,
  PanelLeft,
  PanelRight,
  Save,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { useProject } from "@/hooks/useProjects";
import { useGeneration } from "@/hooks/useGeneration";
import { projectsApi, versionsApi } from "@/services/api";
import PreviewFrame from "@/components/preview/PreviewFrame";
import DeviceToggle from "@/components/preview/DeviceToggle";
import GenerationProgress from "@/components/editor/GenerationProgress";
import AIEditInput from "@/components/editor/AIEditInput";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import type { Version } from "@/types";

export default function ProjectEditorPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { currentProject, setCurrentProject, isGenerating, setIsGenerating, generationProgress, clearProgress } =
    useProjectStore();

  const { data: project, isLoading, refetch } = useProject(projectId);
  const { isConnected } = useGeneration(projectId);

  const [showSidebar, setShowSidebar] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  // Load versions
  useEffect(() => {
    if (projectId) {
      versionsApi.list(projectId).then(setVersions).catch(() => {});
    }
  }, [projectId]);

  const handleGenerate = async () => {
    if (!projectId) return;
    clearProgress();
    setIsGenerating(true);
    try {
      await projectsApi.generate(projectId);
    } catch (error) {
      toast.error("Failed to start generation");
      setIsGenerating(false);
    }
  };

  const handleAIEdit = async (prompt: string) => {
    if (!projectId) return;
    setIsEditing(true);
    try {
      const result = await projectsApi.edit(projectId, prompt);
      toast.success(result.message);
      refetch();
      // Refresh versions
      const v = await versionsApi.list(projectId);
      setVersions(v);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Edit failed");
    } finally {
      setIsEditing(false);
    }
  };

  const handleExport = async () => {
    if (!projectId) return;
    setIsExporting(true);
    try {
      const url = projectsApi.exportUrl(projectId);
      // Download via hidden link
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentProject?.title || "website"}.zip`;
      // Need to auth — fetch with token first
      const token = useAuthStore.getState().token;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      a.href = blobUrl;
      a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!projectId) return;
    try {
      const v = await versionsApi.create(projectId, "Manual save");
      setVersions((prev) => [v, ...prev]);
      toast.success("Version saved!");
    } catch {
      toast.error("Failed to save version");
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!projectId) return;
    try {
      await versionsApi.restore(projectId, versionId);
      toast.success("Version restored!");
      refetch();
      const v = await versionsApi.list(projectId);
      setVersions(v);
    } catch {
      toast.error("Failed to restore version");
    }
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Project not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasContent = project.components && project.components.length > 0;

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1a]">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-semibold">{project.title}</h1>
            <span className="text-xs text-[var(--text-secondary)]">
              {isConnected ? "● Connected" : "○ Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DeviceToggle />
          <div className="w-px h-6 bg-[var(--border)] mx-1" />

          {!hasContent && !isGenerating && (
            <Button size="sm" onClick={handleGenerate}>
              <Sparkles size={14} className="mr-1" />
              Generate
            </Button>
          )}

          {hasContent && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveVersion}
              >
                <Save size={14} className="mr-1" />
                Save
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowVersions(true)}
              >
                <History size={14} className="mr-1" />
                Versions
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                isLoading={isExporting}
              >
                <Download size={14} className="mr-1" />
                Export
              </Button>
            </>
          )}

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            {showSidebar ? <PanelRight size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isGenerating && generationProgress.length > 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <GenerationProgress />
            </div>
          ) : hasContent ? (
            <PreviewFrame />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Sparkles size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
                <h2 className="text-xl font-semibold mb-2">Ready to generate</h2>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md">
                  Click "Generate" to start building your website. AI will plan, design, write copy, and create components step by step.
                </p>
                <Button size="lg" onClick={handleGenerate}>
                  <Sparkles size={18} className="mr-2" />
                  Generate Website
                </Button>
              </div>
            </div>
          )}

          {/* AI Edit Input */}
          {hasContent && (
            <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)]">
              <AIEditInput onSubmit={handleAIEdit} isLoading={isEditing} />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {showSidebar && hasContent && (
          <aside className="w-72 border-l border-[var(--border)] bg-[var(--surface)] overflow-y-auto shrink-0">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                Components
              </h3>
              <div className="space-y-1">
                {project.components
                  ?.sort((a, b) => a.order_num - b.order_num)
                  .map((comp) => (
                    <div
                      key={comp.id}
                      className="px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                    >
                      {comp.name}
                    </div>
                  ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Versions Modal */}
      <Modal
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        title="Version History"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {versions.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">
              No versions yet. Generate or edit to create one.
            </p>
          ) : (
            versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">
                    Version {v.version_number}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {v.message || new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestoreVersion(v.id)}
                >
                  Restore
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
