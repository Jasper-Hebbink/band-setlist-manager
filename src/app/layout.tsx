import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Band Setlist Manager",
  description: "A local learning project for managing cover band songs and setlists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold">
              Band Setlist Manager
            </Link>
            <div className="flex gap-3 text-sm">
              <Link className="rounded border border-zinc-200 px-3 py-2 hover:bg-zinc-50" href="/songs">
                Songs
              </Link>
              <Link className="rounded border border-zinc-200 px-3 py-2 hover:bg-zinc-50" href="/setlists">
                Setlists
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
