"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MockDocument } from "@/lib/mockData";

interface LibraryPanelProps {
  documents: MockDocument[];
  currentDocId: string;
  onUploadStart: (filename: string) => void;
  onUploadSuccess: (doc: MockDocument) => void;
  onUploadError: (errorMsg: string) => void;
}

export default function LibraryPanel({
  documents,
  currentDocId,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}: LibraryPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFilename, setUploadingFilename] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const filename = file.name;
      const sizeInMB = file.size / (1024 * 1024);

      if (sizeInMB > 25) {
        onUploadError(`Couldn't read ${filename}. Try a PDF or DOCX under 25MB.`);
        return;
      }

      const extension = filename.split(".").pop()?.toLowerCase();
      if (extension !== "pdf" && extension !== "docx") {
        onUploadError(`Couldn't read ${filename}. Try a PDF or DOCX under 25MB.`);
        return;
      }

      onUploadStart(filename);
      setIsUploading(true);
      setUploadingFilename(filename);
      setUploadProgress(10);

      let progress = 10;
      const interval = setInterval(() => {
        progress = Math.min(progress + 10, 85);
        setUploadProgress(progress);
      }, 180);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || `Couldn't read ${filename}. Try a PDF or DOCX under 25MB.`);
        }

        const riskResponse = await fetch(
          `/api/risk-scan?docId=${encodeURIComponent(uploadData.id)}`
        );
        const riskData = await riskResponse.json();
        if (!riskResponse.ok) {
          throw new Error(riskData.error || "Risk scan failed.");
        }

        setUploadProgress(100);
        const newDoc: MockDocument = {
          ...uploadData,
          text: riskData.text,
          risks: riskData.risks,
        };

        onUploadSuccess(newDoc);
        router.push(`/workspace/${newDoc.id}`);
      } catch (error) {
        onUploadError(
          error instanceof Error
            ? error.message
            : `Couldn't read ${filename}. Try a PDF or DOCX under 25MB.`
        );
      } finally {
        clearInterval(interval);
        setIsUploading(false);
        setUploadingFilename("");
        setTimeout(() => setUploadProgress(0), 250);
        e.target.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-ink/10">
      {/* Workspace App Title */}
      <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-parchment/30">
        <button
          onClick={() => router.push("/")}
          className="font-serif text-lg font-bold tracking-tight text-ink hover:text-rust transition"
        >
          Marginal
        </button>
        <span className="text-[10px] font-mono uppercase bg-ink/5 px-2 py-0.5 rounded text-ink/65">
          Workspace
        </span>
      </div>

      {/* Upload Block */}
      <div className="p-4 border-b border-ink/10 space-y-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full py-2.5 px-4 rounded border text-xs font-mono font-medium flex items-center justify-center space-x-2 transition ${
            isUploading
              ? "bg-ink/5 text-ink/40 border-ink/5 cursor-not-allowed"
              : "bg-ink text-white border-ink hover:bg-ink/90 focus:ring-1 focus:ring-ink"
          }`}
        >
          {isUploading ? (
            <span>Processing...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Upload Document</span>
            </>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx"
          className="hidden"
        />

        {isUploading && (
          <div className="space-y-2">
            <div className="w-full bg-ink/5 h-[3px] rounded-full overflow-hidden">
              <div
                className="bg-ink h-full rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[10px] font-sans italic text-ink/60">
              Reading {uploadingFilename}… extracting clauses and checking for risk.
            </p>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <span className="text-[9px] font-mono tracking-widest text-ink/40 uppercase px-3 pt-2 pb-1 block">
          Document Library
        </span>
        {documents.length === 0 ? (
          <p className="text-xs text-ink/50 italic px-3 py-4 font-sans leading-relaxed">
            No documents yet. Upload a contract, policy, or report to get started.
          </p>
        ) : (
          documents.map((doc) => {
            const isActive = doc.id === currentDocId;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  if (doc.status === "ready") {
                    router.push(`/workspace/${doc.id}`);
                  }
                }}
                className={`w-full text-left p-3 rounded-md border transition-all flex flex-col space-y-1 ${
                  isActive
                    ? "bg-parchment/60 border-ink/20 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-ink/[0.02]"
                }`}
              >
                <div className="flex justify-between items-center gap-2 w-full">
                  <span
                    className={`text-xs font-sans font-medium truncate w-[75%] ${
                      isActive ? "text-ink font-semibold" : "text-ink/80"
                    }`}
                  >
                    {doc.name}
                  </span>
                  
                  {/* Status Indicator */}
                  <span
                    className={`shrink-0 text-[8px] font-mono font-bold uppercase ${
                      doc.status === "ready"
                        ? "text-verified"
                        : doc.status === "processing"
                        ? "text-amber"
                        : "text-rust"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-mono text-ink/50 w-full">
                  <span>{doc.size}</span>
                  <span>{doc.uploadedAt}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
