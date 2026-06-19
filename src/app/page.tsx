"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<{
    status: "idle" | "uploading" | "error";
    filename?: string;
    progress: number;
    errorMsg?: string;
  }>({ status: "idle", progress: 0 });

  // Interactive mockup state
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [citationClicked, setCitationClicked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase();
    const sizeInMB = file.size / (1024 * 1024);

    if (sizeInMB > 25) {
      setUploadState({
        status: "error",
        errorMsg: `Couldn't read ${filename}. Try a PDF or DOCX under 25MB.`,
        progress: 0,
      });
      return;
    }

    if (extension !== "pdf" && extension !== "docx") {
      setUploadState({
        status: "error",
        errorMsg: `Couldn't read ${filename}. Try a PDF or DOCX under 25MB.`,
        progress: 0,
      });
      return;
    }

    setUploadState({
      status: "uploading",
      filename,
      progress: 10,
    });

    let curProgress = 10;
    const interval = setInterval(() => {
      curProgress = Math.min(curProgress + 12, 85);
      setUploadState((prev) => ({ ...prev, progress: curProgress }));
    }, 250);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await response.json();
      if (!response.ok) {
        throw new Error(uploadData.error);
      }

      setUploadState({ status: "uploading", filename, progress: 100 });
      router.push(
        `/workspace/${uploadData.id}?name=${encodeURIComponent(uploadData.name)}&size=${encodeURIComponent(uploadData.size)}`
      );
    } catch (error) {
      setUploadState({
        status: "error",
        errorMsg:
          error instanceof Error
            ? error.message
            : `Couldn't read ${filename}. Try a PDF or DOCX under 25MB.`,
        progress: 0,
      });
    } finally {
      clearInterval(interval);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCitationClick = () => {
    setCitationClicked(true);
    setTimeout(() => setCitationClicked(false), 1200);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-rust/10 selection:text-rust">
      {/* Header */}
      <header className="border-b border-ink/10 py-4 px-6 md:px-12 flex justify-between items-center bg-parchment/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="font-serif text-xl font-semibold tracking-tight text-ink">Marginal</span>
          <span className="text-[10px] uppercase font-mono tracking-widest bg-ink/5 px-2 py-0.5 rounded text-ink/70">
            beta
          </span>
        </div>
        <div className="flex items-center space-x-6 text-sm font-mono text-ink/75">
          <button
            onClick={() => router.push("/workspace/employment-agreement")}
            className="hover:text-ink hover:underline focus:underline transition"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
        {/* Left Side: Headline & Upload */}
        <section className="lg:col-span-5 flex flex-col justify-center space-y-8 lg:sticky lg:top-28">
          <div className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.1] text-ink tracking-tight">
              AI document intelligence with margin notes that matter.
            </h1>
            <p className="text-base text-ink/80 leading-relaxed font-sans max-w-lg">
              Upload a contract, policy, or report. Ask questions in plain language and get answers grounded in the actual document — with every claim traceable to a page, and every risky clause flagged in the margin.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-ink/20">
            {uploadState.status === "uploading" ? (
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink font-semibold animate-pulse">
                    Reading {uploadState.filename}…
                  </span>
                  <span className="text-ink/60 font-mono">{uploadState.progress}%</span>
                </div>
                <div className="w-full bg-ink/5 h-[3px] rounded-full overflow-hidden">
                  <div
                    className="bg-ink h-full rounded-full transition-all duration-200"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-xs text-ink/60 font-sans italic">
                  Extracting clauses and checking for risk.
                </p>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerUploadClick}
                className={`border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${
                  dragActive
                    ? "border-ink bg-ink/[0.02]"
                    : "border-ink/10 hover:border-ink/30 hover:bg-ink/[0.01]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                  id="file-upload"
                />

                <svg
                  className="w-8 h-8 text-ink/40 mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0016.5 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>

                <p className="text-sm font-sans text-ink font-medium">
                  Drag and drop your file, or <span className="text-rust hover:underline">browse</span>
                </p>
                <p className="text-xs text-ink/50 mt-1 font-mono">
                  Accepts PDF or DOCX up to 25MB
                </p>
              </div>
            )}

            {uploadState.status === "error" && (
              <div className="mt-4 p-3 bg-rust/5 border border-rust/20 rounded flex items-start space-x-2">
                <svg className="w-4 h-4 text-rust mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs font-mono text-rust">{uploadState.errorMsg}</p>
              </div>
            )}
          </div>

          {/* Quick Start Samples */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-ink/50 block">
              Quick Start Samples
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/workspace/employment-agreement")}
                className="flex flex-col text-left p-3 border border-ink/10 hover:border-ink/30 rounded-md bg-white/50 transition-all hover:bg-white"
              >
                <span className="text-xs font-mono text-ink font-semibold truncate">
                  employment_agreement.pdf
                </span>
                <span className="text-[10px] text-ink/60 font-mono mt-1">
                  3 flagged clauses • 1.2 MB
                </span>
              </button>
              <button
                onClick={() => router.push("/workspace/saas-terms")}
                className="flex flex-col text-left p-3 border border-ink/10 hover:border-ink/30 rounded-md bg-white/50 transition-all hover:bg-white"
              >
                <span className="text-xs font-mono text-ink font-semibold truncate">
                  cloudflare_terms.docx
                </span>
                <span className="text-[10px] text-ink/60 font-mono mt-1">
                  3 flagged clauses • 420 KB
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: The Interactive Live Demo */}
        <section className="lg:col-span-7 bg-white rounded-lg border border-ink/10 shadow-md p-6 md:p-8 flex flex-col space-y-8 select-none">
          <div className="flex justify-between items-center border-b border-ink/10 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rust" />
              <span className="text-xs font-mono tracking-wide text-ink font-bold">
                INTERACTIVE SHOWCASE
              </span>
            </div>
            <span className="text-[10px] font-mono text-ink/40">Demo Preview</span>
          </div>

          {/* Document Section Panel */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-ink/40 uppercase tracking-widest">
              From: Employment_Agreement_John_Doe.pdf
            </span>

            {/* The Document View container */}
            <div className="relative border border-ink/10 rounded p-5 bg-parchment/30 overflow-hidden">
              {/* Highlight Overlay Connection */}
              {isHovered && (
                <div className="absolute inset-y-0 right-0 w-[140px] pointer-events-none z-10">
                  <svg className="w-full h-full">
                    {/* SVG Connector line */}
                    <line
                      x1="0"
                      y1="75"
                      x2="130"
                      y2="75"
                      stroke="#B23B2E"
                      strokeWidth="1"
                      className="leader-line drawing"
                    />
                  </svg>
                </div>
              )}

              <div className="pr-[140px] relative font-sans text-sm text-ink leading-relaxed">
                <p className="text-ink/60 mb-2">4. RESTRICTIVE COVENANTS</p>
                <p>
                  For a period of thirty-six (36) months post-termination, the Employee agrees they{" "}
                  <span
                    className={`transition-colors duration-300 px-1 py-0.5 rounded ${
                      isHovered || citationClicked
                        ? "bg-rust/20 text-rust font-semibold"
                        : "bg-rust/5"
                    }`}
                  >
                    shall not, directly or indirectly, consult or consult with any business entity
                    competing in the United States.
                  </span>
                </p>
              </div>

              {/* The Margin Rail Tab */}
              <div
                className="absolute top-10 right-4"
                onMouseEnter={() => {
                  setIsHovered(true);
                  setIsExpanded(true);
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setIsExpanded(false);
                }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div
                  className={`cursor-pointer px-2.5 py-1 rounded-sm border font-mono text-[10px] font-bold tracking-tight transition-all duration-300 ${
                    isHovered
                      ? "bg-rust text-white border-rust shadow-md translate-x-[-4px]"
                      : "bg-rust/5 text-rust border-rust/20"
                  }`}
                >
                  HIGH
                </div>
              </div>
            </div>

            {/* Expanded details below the snippet */}
            <div
              className={`transition-all duration-300 overflow-hidden border border-rust/10 bg-rust/[0.02] rounded-md ${
                isExpanded ? "max-h-[150px] opacity-100 p-4" : "max-h-0 opacity-0 border-transparent"
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold bg-rust text-white px-1.5 py-0.5 rounded">
                  HIGH RISK
                </span>
                <span className="font-mono text-[10px] text-ink/70">p. 3 §4.1</span>
              </div>
              <p className="text-xs text-ink font-semibold">Restrictive Non-Compete</p>
              <p className="text-xs text-ink/70 mt-1">
                A 36-month post-employment non-compete covering the entire United States is extremely restrictive, likely unenforceable in many jurisdictions, and severely impacts future employment options.
              </p>
            </div>
          </div>

          {/* Ask Panel Section */}
          <div className="border-t border-ink/10 pt-6 space-y-4">
            <span className="text-xs font-mono text-ink/40 uppercase tracking-widest block">
              Ask panel interaction
            </span>

            {/* Chat Thread container */}
            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-end">
                <div className="bg-ink/5 text-ink rounded-lg py-2 px-3.5 max-w-[85%]">
                  What is the non-compete clause duration?
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-white border border-ink/10 rounded-lg p-3 max-w-[90%] space-y-2 relative shadow-sm">
                  <p className="leading-relaxed">
                    The agreement contains a very restrictive non-compete clause. It binds the Employee for thirty-six (36) months post-termination.
                  </p>

                  {/* Citation chip */}
                  <div className="flex items-center pt-1">
                    <button
                      onClick={handleCitationClick}
                      className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-verified/10 text-verified hover:bg-verified/25 focus:ring-1 focus:ring-verified transition"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>p. 3 §4.1</span>
                    </button>
                    <span className="text-[10px] text-ink/40 ml-2">Click chip to scroll & highlight</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions for user */}
          <div className="text-xs text-ink/50 bg-ink/[0.01] border border-ink/5 rounded-md p-3 text-center font-mono">
            Hover over the <span className="text-rust font-bold">HIGH</span> tab in the margin rail above, or click the <span className="text-verified font-bold">p. 3 §4.1</span> citation chip to preview how Marginal links answers back to source documents.
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink/10 py-6 px-6 md:px-12 text-center text-xs font-mono text-ink/40 w-full mt-auto">
        <span>Marginal AI Document Intelligence Platform © 2026. Built with precision, paper, and ink.</span>
      </footer>
    </div>
  );
}
