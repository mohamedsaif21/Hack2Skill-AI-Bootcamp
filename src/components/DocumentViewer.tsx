"use client";

import { useEffect, useRef } from "react";
import { MockDocument, RiskClause } from "@/lib/mockData";

interface DocumentViewerProps {
  currentDoc: MockDocument;
  activeClauseId: string | null;
  setActiveClauseId: (id: string | null) => void;
  hoveredClauseId: string | null;
  setHoveredClauseId: (id: string | null) => void;
  scrolledToClauseId: string | null;
  setScrolledToClauseId: (id: string | null) => void;
}

export default function DocumentViewer({
  currentDoc,
  activeClauseId,
  setActiveClauseId,
  hoveredClauseId,
  setHoveredClauseId,
  scrolledToClauseId,
  setScrolledToClauseId,
}: DocumentViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Handle scroll trigger from citation click
  useEffect(() => {
    if (scrolledToClauseId) {
      const risk = currentDoc.risks.find((r) => r.id === scrolledToClauseId);
      if (risk) {
        const lineEl = lineRefs.current[risk.lineIndex];
        if (lineEl && viewerRef.current) {
          lineEl.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Flash highlight
          setActiveClauseId(risk.id);
        }
      }
      setScrolledToClauseId(null);
    }
  }, [scrolledToClauseId, currentDoc, setScrolledToClauseId, setActiveClauseId]);

  const lines = currentDoc.text.split("\n");

  const getLineRisk = (index: number): RiskClause | undefined => {
    return currentDoc.risks.find((r) => r.lineIndex === index);
  };

  const getSeverityColorClass = (severity: "HIGH" | "MEDIUM" | "LOW") => {
    switch (severity) {
      case "HIGH":
        return "text-rust border-rust/30 bg-rust/5 hover:bg-rust hover:text-white hover:border-rust";
      case "MEDIUM":
        return "text-amber border-amber/30 bg-amber/5 hover:bg-amber hover:text-white hover:border-amber";
      case "LOW":
        return "text-ink/60 border-mist/30 bg-mist/5 hover:bg-ink hover:text-white hover:border-ink";
    }
  };

  const getSeverityBadgeClass = (severity: "HIGH" | "MEDIUM" | "LOW") => {
    switch (severity) {
      case "HIGH":
        return "bg-rust text-white";
      case "MEDIUM":
        return "bg-amber text-white";
      case "LOW":
        return "bg-mist text-white";
    }
  };

  const getHighlightClass = (
    severity: "HIGH" | "MEDIUM" | "LOW",
    active: boolean,
    hovered: boolean
  ) => {
    const palette = {
      HIGH: active
        ? "bg-rust/20 text-rust ring-rust/35"
        : hovered
        ? "bg-rust/15 text-rust ring-rust/20"
        : "bg-rust/5 hover:bg-rust/10",
      MEDIUM: active
        ? "bg-amber/20 text-amber ring-amber/35"
        : hovered
        ? "bg-amber/15 text-amber ring-amber/20"
        : "bg-amber/5 hover:bg-amber/10",
      LOW: active
        ? "bg-mist/25 text-ink ring-mist/40"
        : hovered
        ? "bg-mist/20 text-ink ring-mist/30"
        : "bg-mist/10 hover:bg-mist/20",
    };

    return `${palette[severity]} ${active || hovered ? "ring-1" : ""}`;
  };

  const handleLineClick = (riskId: string) => {
    if (activeClauseId === riskId) {
      setActiveClauseId(null);
    } else {
      setActiveClauseId(riskId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-parchment overflow-hidden">
      {/* Doc Viewer Chrome Header */}
      <div className="py-3 px-6 border-b border-ink/10 flex justify-between items-center bg-white">
        <div className="flex items-center space-x-3">
          <svg className="w-4 h-4 text-ink/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="font-serif text-sm font-semibold text-ink truncate max-w-xs md:max-w-md">
            {currentDoc.name}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-ink/40">
            {lines.length} lines
          </span>
        </div>
      </div>

      {/* Main Document Viewer Container */}
      <div
        ref={viewerRef}
        className="flex-1 overflow-y-auto px-6 py-8 md:px-12 flex justify-center"
      >
        {/* Paper Sheet container */}
        <div className="w-full max-w-3xl bg-white border border-ink/10 rounded-md shadow-sm p-8 md:p-12 relative flex flex-col min-h-[90vh]">
          {currentDoc.risks.length === 0 && (
            <div className="mb-6 rounded border border-mist/30 bg-mist/5 px-4 py-3 text-xs text-ink/70">
              No flagged clauses found in this document.
            </div>
          )}
          
          {/* Document Content */}
          <div className="space-y-0.5 select-text pr-[90px] relative">
            {lines.map((line, index) => {
              const risk = getLineRisk(index);
              const isLineActive = risk && activeClauseId === risk.id;
              const isLineHovered = risk && hoveredClauseId === risk.id;

              // Check if we need to split line text for highlighting
              let lineContent: React.ReactNode = line;
              if (risk && line.includes(risk.excerpt.slice(0, 30))) {
                // Approximate excerpt match for text highlight
                const startIdx = line.indexOf(risk.excerpt.substring(0, 15));
                if (startIdx !== -1) {
                  const prefix = line.substring(0, startIdx);
                  const suffix = line.substring(startIdx + risk.excerpt.length);
                  const matchedText = line.substring(startIdx, startIdx + risk.excerpt.length) || risk.excerpt;

                  lineContent = (
                    <>
                      {prefix}
                      <span
                        className={`clause-highlight transition-all duration-200 px-0.5 rounded cursor-pointer ${getHighlightClass(
                          risk.severity,
                          Boolean(isLineActive),
                          Boolean(isLineHovered)
                        )} ${isLineActive ? "font-semibold" : ""}`}
                        onClick={() => handleLineClick(risk.id)}
                        onMouseEnter={() => setHoveredClauseId(risk.id)}
                        onMouseLeave={() => setHoveredClauseId(null)}
                      >
                        {matchedText}
                      </span>
                      {suffix}
                    </>
                  );
                }
              } else if (risk) {
                // Fallback direct whole line highlight if excerpt is not easily matches
                lineContent = (
                  <span
                    className={`clause-highlight transition-all duration-200 px-0.5 rounded cursor-pointer ${getHighlightClass(
                      risk.severity,
                      Boolean(isLineActive),
                      Boolean(isLineHovered)
                    )} ${isLineActive ? "font-semibold" : ""}`}
                    onClick={() => handleLineClick(risk.id)}
                    onMouseEnter={() => setHoveredClauseId(risk.id)}
                    onMouseLeave={() => setHoveredClauseId(null)}
                  >
                    {line}
                  </span>
                );
              }

              return (
                <div
                  key={index}
                  ref={(el) => {
                    lineRefs.current[index] = el;
                  }}
                  className={`relative group flex items-start py-0.5 ${
                    isLineActive ? "z-20" : "z-0"
                  }`}
                >
                  {/* Line Number rail */}
                  <span className="w-8 shrink-0 select-none text-[10px] font-mono text-ink/30 text-right pr-3 pt-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Line Text */}
                  <div className="flex-1 font-sans text-sm text-ink leading-relaxed break-words">
                    {line === "" ? <br /> : lineContent}
                  </div>

                  {/* Margin Tab (Absolute aligned right inside line container) */}
                  {risk && (
                    <div className="margin-tab-reveal absolute right-[-88px] top-0.5 z-30 select-none">
                      
                      {/* Connection SVG Line */}
                      {isLineHovered && (
                        <div className="absolute right-[56px] top-[10px] w-[50px] h-[2px] pointer-events-none overflow-visible">
                          <svg className="w-full h-full">
                            <line
                              x1="0"
                              y1="0"
                              x2="45"
                              y2="0"
                              stroke={
                                risk.severity === "HIGH"
                                  ? "#B23B2E"
                                  : risk.severity === "MEDIUM"
                                  ? "#D98F0B"
                                  : "#8A8F98"
                              }
                              strokeWidth="1"
                              className="leader-line drawing"
                            />
                          </svg>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleLineClick(risk.id)}
                        onMouseEnter={() => setHoveredClauseId(risk.id)}
                        onMouseLeave={() => setHoveredClauseId(null)}
                        className={`px-2 py-0.5 rounded-sm border font-mono text-[9px] font-bold tracking-tight transition-all duration-300 ${getSeverityColorClass(
                          risk.severity
                        )} ${
                          isLineActive
                            ? "scale-105 shadow-sm translate-x-[-2px] text-white"
                            : ""
                        } ${
                          risk.severity === "HIGH" && isLineActive ? "bg-rust text-white border-rust" : ""
                        } ${
                          risk.severity === "MEDIUM" && isLineActive ? "bg-amber text-white border-amber" : ""
                        } ${
                          risk.severity === "LOW" && isLineActive ? "bg-ink text-white border-ink" : ""
                        }`}
                        aria-label={`${risk.severity} risk: ${risk.clauseName}. ${risk.explanation}`}
                        aria-expanded={Boolean(isLineActive)}
                      >
                        {risk.severity}
                      </button>
                    </div>
                  )}

                  {/* Expandable Clause detail embedded directly below the line */}
                  {risk && (
                    <div
                      className={`absolute left-8 right-[-80px] top-[100%] mt-1.5 transition-all duration-300 overflow-hidden border rounded-md shadow-sm bg-white ${
                        isLineActive
                          ? "max-h-[220px] opacity-100 p-4 border-ink/10"
                          : "max-h-0 opacity-0 border-transparent pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${getSeverityBadgeClass(
                              risk.severity
                            )}`}
                          >
                            {risk.severity} RISK
                          </span>
                          <span className="font-mono text-[10px] text-ink/50">
                            {risk.location}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveClauseId(null)}
                          className="text-ink/40 hover:text-ink transition"
                          title="Collapse note"
                          aria-label={`Collapse ${risk.clauseName} note`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <h4 className="text-xs font-sans font-bold text-ink mb-1">
                        {risk.clauseName}
                      </h4>
                      <p className="text-xs text-ink/75 leading-relaxed">
                        {risk.explanation}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-ink/5 flex items-center space-x-1">
                        <span className="text-[9px] font-mono text-ink/40 italic">
                          Excerpt:
                        </span>
                        <p className="text-[10px] text-ink/60 font-mono truncate max-w-xs md:max-w-md">
                          &quot;{risk.excerpt}&quot;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
