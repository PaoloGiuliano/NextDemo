import { NextRequest, NextResponse } from "next/server";
import { fetcher } from "@/lib/clashRoyaleFetcher";

const USERS_API_URL = `https://proxy.royaleapi.dev/v1/players/`;
const options = {
  headers: { Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY} ` },
  cache: "no-store",
};

export const config = {
  runtime: "edge",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playertag: string }> }
) {
  const { playertag } = await params;

  const formattedTag = playertag?.startsWith("#")
    ? `%23${playertag?.slice(1)}`
    : `%23${playertag}`;

  try {
    const player = await fetcher(
      `${USERS_API_URL}${formattedTag.toUpperCase()}`,
      options
    );

    return NextResponse.json(player);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 }
    );
  }
}
