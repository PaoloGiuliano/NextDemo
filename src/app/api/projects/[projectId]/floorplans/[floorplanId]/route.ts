import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; floorplanId: string } }
) {
  const { projectId } = await params;
  const { floorplanId } = await params;
  const { searchParams } = new URL(request.url);
  const access_token = searchParams.get("access_token");
  if (!floorplanId || !projectId) {
    return NextResponse.json(
      { error: "Missing projectId or floorplanId" },
      { status: 400 }
    );
  }

  try {
    // get bearerToken from page through localstorage
    const bearerToken = access_token;
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
