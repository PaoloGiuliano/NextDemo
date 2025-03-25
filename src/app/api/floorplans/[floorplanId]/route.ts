import { NextRequest, NextResponse } from "next/server";
import { getBearerToken } from "@/app/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { floorplanId: string } }
) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const floorplanId = params.floorplanId;
  const API_TOKEN = process.env.API_TOKEN as string;

  if (!floorplanId || !projectId) {
    return NextResponse.json(
      { error: "Missing projectId or floorplanId" },
      { status: 400 }
    );
  }

  try {
    const bearerToken = await getBearerToken(API_TOKEN);

    const response = await fetch(
      `https://client-api.us.fieldwire.com/api/v3/projects/${projectId}/floorplans/${floorplanId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch floorplan");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
