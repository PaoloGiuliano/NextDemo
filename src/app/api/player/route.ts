import { NextResponse } from "next/server";
import { getPlayerInfo } from "@/lib/clashRoyale";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerTag = searchParams.get("tag");

  if (!playerTag) {
    return NextResponse.json({ error: "Missing player tag" }, { status: 400 });
  }

  try {
    const data = await getPlayerInfo(playerTag); // Fetch player data from the API
    return NextResponse.json(data); // Return player data
  } catch (error) {
    console.error("Error fetching player data:", error); // Log error for debugging
    return NextResponse.json(
      { error: "Failed to fetch player data" },
      { status: 500 }
    );
  }
}
