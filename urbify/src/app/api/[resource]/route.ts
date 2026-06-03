/**
 * Catch-all legacy route — kept for backwards compatibility.
 * Real API calls are proxied via next.config.ts rewrites (/api/v1/*).
 */
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  return NextResponse.json(
    { error: `Unknown resource: ${resource}. Use /api/v1/* endpoints.` },
    { status: 404 },
  );
}
