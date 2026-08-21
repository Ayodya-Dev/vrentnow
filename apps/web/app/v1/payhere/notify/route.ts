import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * PayHere IPN lands here (same host as return_url), then is forwarded to the API.
 */

export async function GET() {
  return NextResponse.json({ status: "OK" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const contentType =
    req.headers.get("content-type") ?? "application/x-www-form-urlencoded";

  try {
    const upstream = await fetch(`${env.API_URL}/payhere/notify`, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      console.error(
        `[payhere-notify] API ${upstream.status}: ${text.slice(0, 500)}`,
      );
    }
    return new NextResponse(text || JSON.stringify({ status: "OK" }), {
      status: 200,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("[payhere-notify] forward failed", error);
    return NextResponse.json({ status: "OK" }, { status: 200 });
  }
}
