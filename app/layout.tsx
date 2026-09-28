import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aditya Paruchuri - Software Engineer",
  description: "Personal portfolio showcasing my work as a software engineer",
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  colorScheme: "dark light",
};

// Runs before first paint so the saved theme is applied with no flash.
// Keep in sync with ThemeToggle.tsx (storage key and theme-color values).
const themeInitScript = `(function(){var t="dark";try{var s=localStorage.getItem("theme");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#f6f8fb":"#0b0f14")})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

