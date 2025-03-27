export async function getBearerToken(apiToken: string): Promise<string> {
  try {
    const response = await fetch(
      "https://client-api.super.fieldwire.com/api_keys/jwt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api_token: apiToken }),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch bearer token");

    const data: { access_token: string } = await response.json();
    // console.log(data.access_token);
    return data.access_token;
  } catch (error) {
    console.error("Bearer Token Error:", (error as Error).message);
    throw new Error("Authentication failed");
  }
}
