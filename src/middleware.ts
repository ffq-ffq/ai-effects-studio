import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { locales, routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const apiLimitWindowMs = 60_000;
const apiLimitMaxRequests = 60;
const apiBuckets = new Map<string, { count: number; resetAt: number }>();

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function isAdminPath(pathname: string) {
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/")
  ) {
    return true;
  }

  return locales.some(
    (locale) => pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`),
  );
}

function isWebhookPath(pathname: string) {
  return pathname === "/api/webhook/stripe";
}

function isPublicApiRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method !== "GET") {
    return false;
  }

  return pathname === "/api/health" || pathname === "/api/templates";
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}

function applyApiRateLimit(request: NextRequest) {
  const key = getClientIp(request);
  const now = Date.now();
  const current = apiBuckets.get(key);

  if (!current || current.resetAt <= now) {
    apiBuckets.set(key, { count: 1, resetAt: now + apiLimitWindowMs });
    return null;
  }

  current.count += 1;

  if (current.count > apiLimitMaxRequests) {
    return NextResponse.json(
      { ok: false, error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(apiLimitMaxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(current.resetAt / 1000)),
        },
      },
    );
  }

  return null;
}

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function authorizeAdmin(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return new NextResponse("Supabase auth is not configured", { status: 403 });
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const role = user.app_metadata?.role ?? user.user_metadata?.role;

  if (role === "admin") {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", user.id)
    .single();

  if (profile?.plan_type !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return null;
}

async function authorizeApiUser(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return new NextResponse("Supabase auth is not configured", { status: 401 });
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return null;
}

function getCspHeader() {
  const isDev = process.env.NODE_ENV !== "production";
  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "https://api.stripe.com",
    "https://checkout.stripe.com",
    "https://*.stripe.com",
    "https://*.modal.run",
    ...(isDev ? ["ws://localhost:*", "ws://127.0.0.1:*", "http://localhost:*", "http://127.0.0.1:*"] : []),
  ];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self' https://checkout.stripe.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
    "frame-src https://js.stripe.com https://checkout.stripe.com https://*.stripe.com",
    `connect-src ${connectSrc.join(" ")}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Content-Security-Policy", getCspHeader());
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isApiPath(pathname)) {
    const rateLimited = applyApiRateLimit(request);

    if (rateLimited) {
      return applySecurityHeaders(rateLimited);
    }

    if (isPublicApiRequest(request)) {
      return applySecurityHeaders(NextResponse.next());
    }

    if (isWebhookPath(pathname)) {
      return applySecurityHeaders(NextResponse.next());
    }

    if (isAdminPath(pathname)) {
      const forbidden = await authorizeAdmin(request);

      if (forbidden) {
        return applySecurityHeaders(forbidden);
      }

      return applySecurityHeaders(NextResponse.next());
    }

    const unauthorized = await authorizeApiUser(request);

    if (unauthorized) {
      return applySecurityHeaders(unauthorized);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  if (isAdminPath(pathname)) {
    const forbidden = await authorizeAdmin(request);

    if (forbidden) {
      return applySecurityHeaders(forbidden);
    }
  }

  return applySecurityHeaders(intlMiddleware(request));
}

export const config = {
  matcher: [
    "/",
    "/(zh-CN|en-US)/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
