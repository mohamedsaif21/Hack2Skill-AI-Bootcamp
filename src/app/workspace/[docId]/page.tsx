"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MOCK_DOCUMENTS, MockDocument } from "@/lib/mockData";
import LibraryPanel from "@/components/LibraryPanel";
import DocumentViewer from "@/components/DocumentViewer";
import AskPanel from "@/components/AskPanel";

export default function WorkspaceContainer() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const docId = (params?.docId as string) || "employment-agreement";

  // Session state for documents list (loaded defaults + potential uploads)
  const [documents, setDocuments] = useState<MockDocument[]>(MOCK_DOCUMENTS);
  const [currentDoc, setCurrentDoc] = useState<MockDocument | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Interaction coordination states
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);
  const [hoveredClauseId, setHoveredClauseId] = useState<string | null>(null);
  const [scrolledToClauseId, setScrolledToClauseId] = useState<string | null>(null);

  // Mobile navigation tab states ('library' | 'document' | 'ask')
  const [mobileTab, setMobileTab] = useState<"library" | "document" | "ask">("document");

  // Handle initialization and custom query uploads
  useEffect(() => {
    // If we have custom upload parameters, add it to documents state
    const customName = searchParams.get("name");
    const customSize = searchParams.get("size");

    if (customName && docId && !documents.some((d) => d.id === docId)) {
      const customDoc: MockDocument = {
        id: docId,
        name: customName,
        status: "ready",
        size: customSize || "1.0 MB",
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: `AGREEMENT OF SERVICES (${customName.toUpperCase()})\n\nThis agreement outlines the obligations and terms of use for client files.\n\n1. SCOPE OF SERVICES\nProvider shall perform necessary engineering and design work under Client instructions. Performance is guaranteed under standard conditions.\n\n2. LIMITATION OF LIABILITY\nTo the maximum extent permitted by law, Provider's liability for any material failure under this agreement is restricted to five hundred dollars ($500.00). Client waives any consequential or indirect claims.\n\n3. INTELLECTUAL PROPERTY AND ASSIGNMENT\nAll IP created by Provider or Client during the project belongs exclusively to Provider. Client gets a temporary, non-transferable license.\n\n4. COVENANTS AND POST-AGREEMENT TERMINATION\nFor twenty-four (24) months post termination, Client cannot hire any developers associated with Provider.`,
        risks: [
          {
            id: "custom-risk-liability",
            severity: "HIGH",
            clauseName: "Strict Liability Cap",
            excerpt: "Provider's liability for any material failure under this agreement is restricted to five hundred dollars ($500.00).",
            explanation: "The liability cap of $500 provides almost no real recourse for service failures that damage corporate infrastructure or operations.",
            location: "p. 2 §2.0",
            lineIndex: 8,
          },
          {
            id: "custom-risk-ip",
            severity: "MEDIUM",
            clauseName: "Exclusionary IP Rights",
            excerpt: "All IP created by Provider or Client during the project belongs exclusively to Provider.",
            explanation: "This clause blocks the client from owning the project output they are paying for, granting only a temporary usage license.",
            location: "p. 3 §3.0",
            lineIndex: 11,
          },
          {
            id: "custom-risk-nonhire",
            severity: "LOW",
            clauseName: "Non-Solicitation Covenant",
            excerpt: "For twenty-four (24) months post termination, Client cannot hire any developers associated with Provider.",
            explanation: "A two-year non-solicitation term is common but moderately restrictive depending on standard developer recruitment routes.",
            location: "p. 4 §4.0",
            lineIndex: 14,
          }
        ]
      };

      setDocuments((prev) => [customDoc, ...prev]);
      setCurrentDoc(customDoc);
    } else {
      const doc = documents.find((d) => d.id === docId);
      if (doc) {
        setCurrentDoc(doc);
      } else {
        // Redirect to default if not found
        router.replace("/workspace/employment-agreement");
      }
    }
  }, [docId, searchParams, router, documents]);

  // Handle uploading and parsing events
  const handleUploadStart = (filename: string) => {
    setUploadError(null);
    const tempId = filename.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const tempDoc: MockDocument = {
      id: tempId,
      name: filename,
      status: "processing",
      size: "Calculating...",
      uploadedAt: "Just now",
      text: "",
      risks: [],
    };
    setDocuments((prev) => [tempDoc, ...prev]);
  };

  const handleUploadSuccess = (newDoc: MockDocument) => {
    setUploadError(null);
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== newDoc.id);
      return [newDoc, ...filtered];
    });
  };

  const handleUploadError = (errorMsg: string) => {
    setUploadError(errorMsg);
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.status === "processing" ? { ...doc, status: "error" as const } : doc
      )
    );
  };

  const handleCitationClick = (riskId: string) => {
    setScrolledToClauseId(riskId);
    // Automatically switch to document view on mobile when clicking citation
    setMobileTab("document");
  };

  if (!currentDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment font-mono text-sm">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-4 h-4 border border-ink border-t-transparent rounded-full animate-spin"></div>
          <span>Loading workspace environment…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {uploadError && (
        <div
          className="shrink-0 border-b border-rust/20 bg-rust/5 px-4 py-2 text-xs text-rust"
          role="alert"
        >
          {uploadError}
        </div>
      )}
      {/* Workspace Shell Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden three-pane-height">
        
        {/* Left Pane: Library */}
        <div
          className={`col-span-12 md:col-span-3 h-full overflow-hidden ${
            mobileTab === "library" ? "block" : "hidden md:block"
          }`}
        >
          <LibraryPanel
            documents={documents}
            currentDocId={currentDoc.id}
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Center Pane: Document Viewer */}
        <div
          className={`col-span-12 md:col-span-6 h-full overflow-hidden ${
            mobileTab === "document" ? "block" : "hidden md:block"
          }`}
        >
          <DocumentViewer
            currentDoc={currentDoc}
            activeClauseId={activeClauseId}
            setActiveClauseId={setActiveClauseId}
            hoveredClauseId={hoveredClauseId}
            setHoveredClauseId={setHoveredClauseId}
            scrolledToClauseId={scrolledToClauseId}
            setScrolledToClauseId={setScrolledToClauseId}
          />
        </div>

        {/* Right Pane: Conversation Ask Panel */}
        <div
          className={`col-span-12 md:col-span-3 h-full overflow-hidden ${
            mobileTab === "ask" ? "block" : "hidden md:block"
          }`}
        >
          <AskPanel
            currentDoc={currentDoc}
            onCitationClick={handleCitationClick}
            activeClauseId={activeClauseId}
          />
        </div>
      </div>

      {/* Bottom Navigation Bar for Mobile viewports */}
      <div className="md:hidden border-t border-ink/10 bg-white grid grid-cols-3 h-[57px] shrink-0">
        <button
          onClick={() => setMobileTab("library")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            mobileTab === "library" ? "text-rust font-bold" : "text-ink/60"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.1-8.243-.282m16.486 0c-.22 1.637-1.22 3.197-2.735 4.385m-11.016 0c1.515-1.188 2.515-2.748 2.735-4.385" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight">Library</span>
        </button>

        <button
          onClick={() => setMobileTab("document")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            mobileTab === "document" ? "text-rust font-bold" : "text-ink/60"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight">Document</span>
        </button>

        <button
          onClick={() => setMobileTab("ask")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            mobileTab === "ask" ? "text-rust font-bold" : "text-ink/60"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight">Ask Panel</span>
        </button>
      </div>
    </div>
  );
}
