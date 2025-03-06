export async function getPlayerInfo(playerTag: string) {
  const formattedTag = playerTag.replace("#", "%23"); // Convert `#` to URL-safe format
  const res = await fetch(
    `https://api.clashroyale.com/v1/players/${formattedTag}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
      },
      cache: "no-store", // Always fetch fresh data
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch player data");
  }

  return res.json();
}
