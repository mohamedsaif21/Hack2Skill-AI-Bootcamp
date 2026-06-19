import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase();
    const sizeInMB = file.size / (1024 * 1024);

    // Validate size (max 25MB) and type
    if (sizeInMB > 25) {
      return NextResponse.json(
        { error: `Couldn't read ${filename}. Try a PDF or DOCX under 25MB.` },
        { status: 400 }
      );
    }

    if (extension !== "pdf" && extension !== "docx") {
      return NextResponse.json(
        { error: `Couldn't read ${filename}. Try a PDF or DOCX under 25MB.` },
        { status: 400 }
      );
    }

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return a mock document representation
    // We create a mock ID from the name
    const mockId = filename.toLowerCase().replace(/[^a-z0-9]/g, "-");

    return NextResponse.json({
      id: mockId,
      name: filename,
      status: "ready",
      size: `${sizeInMB.toFixed(1)} MB`,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
