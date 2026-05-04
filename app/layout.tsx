import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System Extractor",
  description: "Extract design systems in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
