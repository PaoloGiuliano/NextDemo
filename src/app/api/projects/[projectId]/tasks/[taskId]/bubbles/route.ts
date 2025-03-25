import { NextRequest, NextResponse } from "next/server";
import { getBearerToken } from "@/app/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: { projectId: string; taskId: string } }
) {
  const { projectId } = await context.params;
  const { taskId } = await context.params;
  const API_TOKEN = process.env.API_TOKEN as string;

  if (!taskId || !projectId) {
    return NextResponse.json(
      { error: "Missing projectId or taskId" },
      { status: 400 }
    );
  }

  try {
    const bearerToken = await getBearerToken(API_TOKEN);

    const response = await fetch(
      `https://client-api.us.fieldwire.com/api/v3/projects/${projectId}/tasks/${taskId}/bubbles`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
          "Fieldwire-Version": "2023-01-25",
          "Fieldwire-Filter": "active",
          "Fieldwire-Per-Page": "100",
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
