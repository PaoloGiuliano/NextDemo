import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const api_token_from_env = process.env.API_TOKEN;

    const response = await fetch(
      "https://client-api.super.fieldwire.com/api_keys/jwt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ api_token: api_token_from_env }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `this is the access token response data from /api/auth/${data.access_token}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("cant fetch access token in /api/auth", error);
    return NextResponse.json(
      { error: "Failed to fetch access token" },
      { status: 500 }
    );
  }
}
