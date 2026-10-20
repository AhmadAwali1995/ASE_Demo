import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Newsreader, Noto_Naskh_Arabic, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, text, type Locale } from "@/lib/i18n";
import "../globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const arabicSans = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

const arabicSerif = Noto_Naskh_Arabic({
  variable: "--font-arabic-serif",
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
});

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = text(isLocale(locale) ? locale : "en");
  return {
    title: {
      default: copy.metaTitle,
      template: `%s · ${copy.brand}`,
    },
    description: copy.metaDescription,
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${outfit.variable} ${newsreader.variable} ${arabicSans.variable} ${arabicSerif.variable}`}
    >
      <body className="antialiased">
        <SiteHeader locale={locale} />
        {children}
      </body>
    </html>
  );
}
