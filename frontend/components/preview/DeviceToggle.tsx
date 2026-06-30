"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import clsx from "clsx";

const devices = [
  { key: "desktop" as const, icon: Monitor, label: "Desktop" },
  { key: "tablet" as const, icon: Tablet, label: "Tablet" },
  { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
];

export default function DeviceToggle() {
  const { deviceView, setDeviceView } = useProjectStore();

  return (
    <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
      {devices.map((device) => (
        <button
          key={device.key}
          onClick={() => setDeviceView(device.key)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all",
            deviceView === device.key
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <device.icon size={14} />
          <span className="hidden sm:inline">{device.label}</span>
        </button>
      ))}
    </div>
  );
}
