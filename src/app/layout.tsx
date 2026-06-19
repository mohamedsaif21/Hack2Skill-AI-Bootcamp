import type { Metadata } from "next";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/source-serif-4/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marginal — AI Document Intelligence",
  description: "AI document intelligence with margin notes that matter. Upload a contract or report, ask it questions, and verify claims with inline page citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-ink bg-parchment font-sans selection:bg-rust/10 selection:text-rust">
        {children}
      </body>
    </html>
  );
}
