import { NextRequest, NextResponse } from "next/server";
import { MOCK_DOCUMENTS } from "@/lib/mockData";

const CUSTOM_DOCUMENT_TEXT = `AGREEMENT OF SERVICES

This agreement is executed between Client and Provider. The following sections outline duties and liabilities.

1. SCOPE OF SERVICES
Provider shall perform necessary engineering and design work under Client instructions. Performance is guaranteed under standard conditions.

2. LIMITATION OF LIABILITY
To the maximum extent permitted by law, Provider's liability for any material failure under this agreement is restricted to five hundred dollars ($500.00). Client waives any consequential or indirect claims.

3. INTELLECTUAL PROPERTY AND ASSIGNMENT
All IP created by Provider or Client during the project belongs exclusively to Provider. Client gets a temporary, non-transferable license.

4. COVENANTS AND POST-AGREEMENT TERMINATION
For twenty-four (24) months post termination, Client cannot hire any developers associated with Provider.`;

const CUSTOM_RISKS = [
  {
    id: "custom-risk-liability",
    severity: "HIGH" as const,
    clauseName: "Strict Liability Cap",
    excerpt: "Provider's liability for any material failure under this agreement is restricted to five hundred dollars ($500.00).",
    explanation: "The $500 liability cap provides little recourse for service failures that damage operations.",
    location: "p. 2 §2.0",
    lineIndex: 8,
  },
  {
    id: "custom-risk-ip",
    severity: "MEDIUM" as const,
    clauseName: "Exclusionary IP Rights",
    excerpt: "All IP created by Provider or Client during the project belongs exclusively to Provider.",
    explanation: "The client does not own the project output it funds and receives only a temporary license.",
    location: "p. 3 §3.0",
    lineIndex: 11,
  },
  {
    id: "custom-risk-nonhire",
    severity: "LOW" as const,
    clauseName: "Non-Solicitation Covenant",
    excerpt: "For twenty-four (24) months post termination, Client cannot hire any developers associated with Provider.",
    explanation: "The two-year hiring restriction may limit ordinary recruiting after the agreement ends.",
    location: "p. 4 §4.0",
    lineIndex: 14,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");

  if (!docId) {
    return NextResponse.json({ error: "Missing docId parameter" }, { status: 400 });
  }

  const doc = MOCK_DOCUMENTS.find((d) => d.id === docId);

  return NextResponse.json({
    docId,
    text: doc?.text ?? CUSTOM_DOCUMENT_TEXT,
    risks: doc?.risks ?? CUSTOM_RISKS,
  });
}
