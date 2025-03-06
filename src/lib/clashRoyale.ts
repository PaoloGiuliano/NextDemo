export async function getPlayerInfo(playerTag: string) {
  // if player tag doesnt start with '#' add it first
  const formattedTag = "%23" + playerTag.replace(/#/g, "").toUpperCase();
  const res = await fetch(
    `https://proxy.royaleapi.dev/v1/players/${formattedTag}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
      },
      cache: "no-store", // Always fetch fresh data
    }
  );

  if (!res.ok) {
    const errorText = await res.text(); // Log the error body for more details
    console.error("Error response body:", errorText);
    throw new Error("Failed to fetch player data");
  }

  return res.json();
}
