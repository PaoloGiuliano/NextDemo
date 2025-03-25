import { NextResponse } from "next/server";
import { getBearerToken } from "@/app/lib/auth";

export async function GET(context: { params: { projectId: string } }) {
  const { projectId } = await context.params; // ✅ Await params

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const API_TOKEN = process.env.API_TOKEN as string;
    const bearerToken = await getBearerToken(API_TOKEN);

    const response = await fetch(
      `https://client-api.us.fieldwire.com/api/v3/projects/${projectId}/tasks`,
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

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
