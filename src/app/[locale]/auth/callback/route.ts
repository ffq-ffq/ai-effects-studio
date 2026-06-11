import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const locale = url.pathname.split("/")[1] || "zh-CN";

  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
}
