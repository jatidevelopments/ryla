"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

interface MermaidProps {
  chart: string;
  className?: string;
}

export function Mermaid({ chart, className }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (isInitialized) return;

    // Initialize Mermaid once
    mermaid.initialize({
      startOnLoad: true,
      theme: theme === "dark" ? "dark" : "default",
      themeVariables: {
        primaryColor: "#6366f1",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#818cf8",
        lineColor: theme === "dark" ? "#374151" : "#e5e7eb",
        secondaryColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
        tertiaryColor: theme === "dark" ? "#111827" : "#ffffff",
        background: theme === "dark" ? "#111827" : "#ffffff",
        mainBkg: theme === "dark" ? "#1f2937" : "#ffffff",
        secondBkg: theme === "dark" ? "#111827" : "#f9fafb",
        textColor: theme === "dark" ? "#f9fafb" : "#1f2937",
        secondaryTextColor: theme === "dark" ? "#9ca3af" : "#6b7280",
        tertiaryTextColor: theme === "dark" ? "#6b7280" : "#9ca3af",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "14px",
      },
      darkMode: theme === "dark",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
        padding: 20,
      },
    });
    setIsInitialized(true);
  }, [isInitialized, theme]);

  useEffect(() => {
    if (!ref.current || !isInitialized) return;

    // Generate unique ID for this chart
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    // Clear previous content
    ref.current.innerHTML = "";

    // Create pre element with mermaid class
    const pre = document.createElement("pre");
    pre.className = "mermaid";
    pre.textContent = chart;
    ref.current.appendChild(pre);

    // Update theme if it changed
    mermaid.initialize({
      theme: theme === "dark" ? "dark" : "default",
      darkMode: theme === "dark",
    });

    // Render the chart
    mermaid
      .run({
        nodes: [pre],
        suppressErrors: false,
      })
      .catch((error) => {
        console.error("Mermaid rendering error:", error);
      });
  }, [chart, isInitialized, theme]);

  return (
    <div
      ref={ref}
      className={`mermaid-container ${className || ""}`}
      style={{ minHeight: "200px", overflow: "auto" }}
    />
  );
}
