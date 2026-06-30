"use client";

import { useRef, useEffect, useState } from "react";
import { useProjectStore } from "@/store/projectStore";

export default function PreviewFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { previewCode, deviceView, currentProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);

  const widthMap = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // Build preview HTML from components
  useEffect(() => {
    if (currentProject?.components && currentProject.components.length > 0) {
      setIsLoading(false);
    }
  }, [currentProject]);

  const getPreviewHtml = () => {
    if (!currentProject?.components) return "<html><body><p>No preview available</p></body></html>";

    const components = currentProject.components;
    const styles = components
      .filter((c) => c.name === "App" || c.file_path.includes(".css"))
      .map((c) => c.code)
      .join("\n");

    const appComp = components.find((c) => c.name === "App");
    const otherComps = components.filter((c) => c.name !== "App" && !c.file_path.includes(".css"));

    // Inline rendering: combine all components as script tags with raw JSX
    // For a real preview, we'd use a bundler in the browser (e.g., @babel/standalone)
    // For MVP, render as styled HTML sections
    const sectionsHtml = otherComps
      .map((c) => {
        // Extract JSX from the component — simplified, renders raw HTML structure
        const code = c.code;
        return `<section id="${c.name.toLowerCase()}">${c.name}</section>`;
      })
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${currentProject.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f1f5f9; }
    section { padding: 4rem 2rem; min-height: 200px; display: flex; align-items: center; justify-content: center; }
    section:nth-child(odd) { background: #1e293b; }
  </style>
</head>
<body>
  ${sectionsHtml}
</body>
</html>`;
  };

  return (
    <div className="flex flex-col items-center flex-1 bg-[#0a0f1a] overflow-hidden">
      {/* Toolbar */}
      <div className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[var(--surface)] border-b border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)]">Preview</span>
      </div>

      {/* Iframe */}
      <div
        className="flex-1 w-full overflow-auto flex justify-center p-4"
        style={{ backgroundColor: "#0a0f1a" }}
      >
        <div
          style={{
            width: widthMap[deviceView],
            transition: "width 0.3s ease",
            minWidth: "320px",
          }}
          className="h-full"
        >
          <iframe
            ref={iframeRef}
            srcDoc={getPreviewHtml()}
            className="w-full h-full rounded-lg border border-[var(--border)] bg-white"
            style={{ minHeight: "500px" }}
            title="Website Preview"
          />
        </div>
      </div>
    </div>
  );
}
