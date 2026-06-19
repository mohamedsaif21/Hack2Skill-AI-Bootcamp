"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MockDocument } from "@/lib/mockData";

interface Message {
  role: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
}

interface AskPanelProps {
  currentDoc: MockDocument;
  onCitationClick: (riskId: string) => void;
  activeClauseId: string | null;
}

export default function AskPanel({
  currentDoc,
  onCitationClick,
  activeClauseId,
}: AskPanelProps) {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const docId = currentDoc.id;
  const currentMessages = useMemo(() => messages[docId] || [], [messages, docId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isStreaming]);

  // Clean chat when switching documents if not initialized
  const getSampleQuestions = () => {
    if (docId === "employment-agreement") {
      return [
        "What are the non-compete terms?",
        "How is intellectual property handled?",
        "What is the notice period for termination?",
      ];
    } else if (docId === "saas-terms") {
      return [
        "What is the SLA credit?",
        "Does pricing increase?",
        "What happens to customer data?",
      ];
    }
    return ["What is this contract about?", "Summarize the key liabilities", "Identify termination notice rules"];
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Add user message
    const updatedUserMsgs = [
      ...currentMessages,
      { role: "user" as const, text },
    ];
    setMessages((prev) => ({ ...prev, [docId]: updatedUserMsgs }));
    setInputText("");
    setIsStreaming(true);

    // Add empty placeholder assistant message for streaming
    const placeholderMsg: Message = { role: "assistant" as const, text: "", isStreaming: true };
    setMessages((prev) => ({
      ...prev,
      [docId]: [...updatedUserMsgs, placeholderMsg],
    }));

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, docId }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedAnswer = "";
      let eventBuffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          eventBuffer += decoder.decode(value, { stream: !done });
          const events = eventBuffer.split("\n\n");
          eventBuffer = events.pop() ?? "";

          for (const event of events) {
            const line = event.split("\n").find((entry) => entry.startsWith("data: "));
            if (line) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.token) {
                  streamedAnswer += data.token;
                  // Update the last message in state with current progress
                  setMessages((prev) => {
                    const currentList = prev[docId] || [];
                    const newList = [...currentList];
                    newList[newList.length - 1] = {
                      role: "assistant",
                      text: streamedAnswer,
                      isStreaming: true,
                    };
                    return { ...prev, [docId]: newList };
                  });
                } else if (data.event === "done") {
                  // Finish streaming
                  setMessages((prev) => {
                    const currentList = prev[docId] || [];
                    const newList = [...currentList];
                    newList[newList.length - 1] = {
                      role: "assistant",
                      text: streamedAnswer,
                      isStreaming: false,
                    };
                    return { ...prev, [docId]: newList };
                  });
                }
              } catch {
                // Ignore malformed mock events while preserving the stream.
              }
            }
          }

          if (done) break;
        }
      }
    } catch {
      setMessages((prev) => {
        const currentList = prev[docId] || [];
        const newList = [...currentList];
        newList[newList.length - 1] = {
          role: "assistant",
          text: "The answer stream stopped. Try the question again.",
          isStreaming: false,
        };
        return { ...prev, [docId]: newList };
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const renderParsedMessage = (text: string) => {
    // Regex matches [p. X §Y] or [p. X §Y.Z] citations
    const regex = /(\[p\.\s*\d+\s*§[^\]]+\])/g;
    const citationPattern = /^\[p\.\s*\d+\s*§[^\]]+\]$/;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (citationPattern.test(part)) {
        const citationText = part.slice(1, -1); // strip [ and ]
        // Find corresponding risk id
        const matchedRisk = currentDoc.risks.find(
          (r) => r.location.replace(/\s+/g, "") === citationText.replace(/\s+/g, "")
        );

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (matchedRisk) {
                onCitationClick(matchedRisk.id);
              }
            }}
            aria-label={`Jump to citation ${citationText}`}
            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition mx-0.5 align-baseline border focus:outline-none focus:ring-1 focus:ring-verified ${
              matchedRisk && activeClauseId === matchedRisk.id
                ? "bg-verified text-white border-verified"
                : "bg-verified/10 text-verified border-verified/20 hover:bg-verified/20"
            }`}
          >
            <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{citationText}</span>
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-ink/10">
      {/* Chrome header */}
      <div className="py-3 px-4 border-b border-ink/10 flex items-center justify-between bg-parchment/30">
        <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
          Ask Panel
        </span>
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-verified"></span>
          <span className="text-[10px] font-mono text-ink/60">Grounded Mode</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.length === 0 ? (
          /* Empty State Details */
          <div className="py-8 px-4 text-center space-y-4">
            <svg className="w-8 h-8 text-ink/20 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-xs text-ink/70 leading-relaxed font-sans max-w-[240px] mx-auto">
              Ask anything about this document. Answers are grounded in its text, with page citations.
            </p>

            {/* Quick Ask Questions */}
            <div className="pt-6 text-left space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-ink/40 block mb-1">
                Suggested Questions
              </span>
              {getSampleQuestions().map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(question)}
                  disabled={isStreaming}
                  className="w-full text-left p-2.5 rounded border border-ink/5 bg-ink/[0.01] hover:border-ink/20 hover:bg-ink/[0.02] text-xs text-ink/80 transition duration-150"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Thread */
          <div className="space-y-4">
            {currentMessages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-ink text-white font-sans"
                        : "bg-parchment/30 text-ink border border-ink/10 shadow-sm font-sans"
                    }`}
                  >
                    {isUser ? (
                      <p>{msg.text}</p>
                    ) : (
                      <div className="space-y-1">
                        <div>{renderParsedMessage(msg.text)}</div>
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-3 bg-ink/30 animate-pulse ml-0.5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-ink/10 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isStreaming}
            placeholder={
              isStreaming
                ? "Streaming answers..."
                : "Ask about clauses, SLA remedies, etc..."
            }
            className="w-full text-xs font-sans pl-3 pr-10 py-2.5 border border-ink/10 rounded-md focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none placeholder-ink/40 bg-parchment/5"
          />
          <button
            type="submit"
            disabled={isStreaming || !inputText.trim()}
            aria-label="Send question"
            className={`absolute right-1.5 p-1.5 rounded transition ${
              isStreaming || !inputText.trim()
                ? "text-ink/20 cursor-not-allowed"
                : "text-ink hover:text-rust"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
