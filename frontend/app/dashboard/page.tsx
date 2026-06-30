"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import ProjectList from "@/components/dashboard/ProjectList";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-[var(--primary)]" />
          <span className="font-bold">AI Website Builder</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-secondary)]">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut size={16} className="mr-1" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <ProjectList />
      </main>
    </div>
  );
}
