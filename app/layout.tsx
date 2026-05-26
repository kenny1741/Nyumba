import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyumba Kenya — Find Your Perfect Home",
  description: "Search rental properties across Kenya. Find houses, apartments, bedsitters and more in Nairobi, Thika, Ruiru, Juja, Kiambu and beyond.",
  keywords: "houses for rent Kenya, rental properties Nairobi, bedsitter Juja, 1 bedroom Thika, Ruiru apartments",
  openGraph: {
    title: "Nyumba Kenya",
    description: "Find your perfect home across Kenya",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
