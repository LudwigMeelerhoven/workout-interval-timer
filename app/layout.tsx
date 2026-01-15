import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interval HIIT Timer",
  description: "A workout timer with customizable exercises and rounds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Using CDN for Tailwind to match original project structure request, 
            though typically Next.js uses globals.css */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}