import { NextResponse, NextRequest } from "next/server";
import { fetcher } from "@/lib/clashRoyaleFetcher";

const USERS_API_URL = `https://proxy.royaleapi.dev/v1/players/`;
const options = {
  headers: { Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY} ` },
  cache: "no-store",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { playertag: string } }
) {
  const { playertag } = params;

  const formattedTag = playertag?.startsWith("#")
    ? `%23${playertag?.slice(1)}`
    : `%23${playertag}`;

  try {
    const battlelog = await fetcher(
      `${USERS_API_URL}${formattedTag.toUpperCase()}/battlelog`,
      options
    );
    return NextResponse.json(battlelog);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch battlelog" },
      { status: 500 }
    );
  }
}
