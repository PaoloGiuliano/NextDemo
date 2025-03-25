import { NextResponse } from "next/server";
import { getBearerToken } from "@/app/lib/auth";

export async function GET() {
  const API_TOKEN = process.env.API_TOKEN as string;

  try {
    const bearerToken = await getBearerToken(API_TOKEN);

    const response = await fetch(
      "https://client-api.us.fieldwire.com/api/v3/account/projects",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
          "Fieldwire-Version": "2023-01-25",
          "Fieldwire-Filter": "active",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch projects");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
