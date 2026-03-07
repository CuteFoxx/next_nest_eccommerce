import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";
import { decodeJwt } from "jose";

export const runtime = "nodejs";

const protectedRoutes = ["/profile"];
const adminRoutes = ["/admin"];

export async function middleware(req: NextRequest) {
  const authToken = req.cookies.get("Authentication");
  const refreshToken = req.cookies.get("Refresh");
  console.log(authToken);

  if (!authToken && refreshToken) {
    try {
      const refreshRes = await serverApi.post("/auth/refresh", null, {
        headers: { Cookie: `Refresh=${refreshToken.value}` },
      });

      const response = NextResponse.redirect(req.url);
      const setCookies = refreshRes.headers["set-cookie"];
      if (setCookies) {
        for (const cookie of setCookies) {
          response.headers.append("Set-Cookie", cookie);
        }
      }
      return response;
    } catch {}
  }

  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !authToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdmin) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const payload = decodeJwt(authToken.value);
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
