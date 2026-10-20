import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n";

const cookie = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1] ?? "";
  if (isLocale(segment)) {
    const response = NextResponse.next();
    response.cookies.set("locale", segment, cookie);
    return response;
  }

  const locale = preferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set("locale", locale, cookie);
  return response;
}

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("locale")?.value;
  if (saved === "ar" || saved === "en") return saved;
  const header = request.headers.get("accept-language") ?? "";
  return header.split(",")[0]?.trim().toLowerCase().startsWith("ar") ? "ar" : "en";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
