import "./globals.css";
import { Public_Sans } from "next/font/google";

import { Navbar } from "@/components/Navbar";

const publicSans = Public_Sans({ subsets: ["latin"] });

const title = "EEA Documents Chat Agent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta name="description" content={title} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={title} />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={title} />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={publicSans.className}>
        <div className="p-2 md:p-4">
          <Navbar />
        </div>
        <div className="flex flex-col p-4 md:p-12 h-[100vh]">{children}</div>
      </body>
    </html>
  );
}
