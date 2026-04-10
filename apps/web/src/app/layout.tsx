import { Bodoni_Moda, Jost } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { generateOrganizationSchema } from "@/lib/seo";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * Page metadata for SEO and branding
 * Used in browser title, social sharing, and search results
 */
export const metadata: Metadata = {
  title:
    "Illustriober Creatives - Full-Stack Web & Mobile Development Studio",
  description:
    "Premium creative studio specializing in full-stack web development, mobile apps, UI/UX design, and cloud deployment. We build remarkable digital experiences.",
  keywords: [
    "web development",
    "mobile app",
    "UI/UX design",
    "full-stack",
    "React",
    "Next.js",
  ],
  authors: [{ name: "Illustriober Creatives" }],
  metadataBase: new URL("https://illustriober.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Illustriober Creatives - Premium Tech Studio",
    description:
      "Build remarkable digital experiences with our expert team of developers and designers.",
    url: "https://illustriober.com",
    siteName: "Illustriober Creatives",
    images: [
      {
        url: "https://illustriober.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Illustriober Creatives",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Illustriober Creatives",
    description: "Premium tech studio for web & mobile development",
    creator: "@illustriober",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schema = generateOrganizationSchema();

  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${jost.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
