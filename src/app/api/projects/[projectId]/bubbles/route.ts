import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { searchParams } = new URL(request.url);
  const access_token = searchParams.get("access_token");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const bearerToken = access_token;

    const response = await fetch(
      `https://client-api.us.fieldwire.com/api/v3/projects/${projectId}/bubbles`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
          "Fieldwire-Version": "2023-01-25",
          "Fieldwire-Filter": "active",
          "Fieldwire-Per-Page": "1000",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch bubbles");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
