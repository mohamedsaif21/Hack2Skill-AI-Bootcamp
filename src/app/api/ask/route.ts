import { NextRequest } from "next/server";
import { MOCK_QNA } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const { question, docId } = await req.json();

    if (!docId || typeof question !== "string" || !question.trim()) {
      return new Response(JSON.stringify({ error: "Missing question or docId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleanQuestion = question.trim().toLowerCase();
    const docAnswers = MOCK_QNA[docId] || MOCK_QNA["employment-agreement"];
    
    // Attempt matching the question to mock keys
    let selectedResponse = docAnswers["default"];
    let matched = false;
    for (const key of Object.keys(docAnswers)) {
      const normalizedKey = key.toLowerCase().replace(/[?]/g, "");
      if (key !== "default" && cleanQuestion.includes(normalizedKey)) {
        selectedResponse = docAnswers[key];
        matched = true;
        break;
      }
    }

    const answer = matched
      ? selectedResponse.answer
      : `Nothing in this document directly answers that. Here's the closest related clause: ${selectedResponse.answer}`;

    // Split response into small chunks of words/characters to stream
    const words = answer.split(" ");
    const citations = selectedResponse.citations;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "start" })}\n\n`));

        // Stream word by word
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i === words.length - 1 ? "" : " ");
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token: word })}\n\n`)
          );
          // Wait slightly to simulate streaming
          await new Promise((resolve) => setTimeout(resolve, 40));
        }

        // Send final event with complete citations list
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ event: "done", citations })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Streaming failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
