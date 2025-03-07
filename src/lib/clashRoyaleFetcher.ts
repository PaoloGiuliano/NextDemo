const formatTag = (tag: string) => {
  return "%23" + tag.replace(/#/g, "").toUpperCase();
};

export async function getPlayerInfo(playerTag: string) {
  // if player tag doesnt start with '#' add it first
  const formattedTag = formatTag(playerTag);
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

export async function getUpcomingChests(playerTag: string) {
  const formattedTag = formatTag(playerTag);
  const response = await fetch(
    `https://proxy.royaleapi.dev/v1/players/${formattedTag}/upcomingchests`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
      },
      cache: "no-store", // Alaway fetch fresh data
    }
  );

  if (!response.ok) {
    const errorText = await response.text(); // Log the error body for more details
    console.error("Error response body:", errorText);
    throw new Error("Failed to fetch upcoming chests data");
  }

  return response.json();
}
export async function getBattleLog(playerTag: string) {
  const formattedTag = formatTag(playerTag);
  const response = await fetch(
    `https://proxy.royaleapi.dev/v1/players/${formattedTag}/battlelog`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
      },
      cache: "no-store", // Alaway fetch fresh data
    }
  );
  if (!response.ok) {
    const errorText = await response.text(); // Log the error body for more details
    console.error("Error response body:", errorText);
    throw new Error("Failed to fetch battle log data");
  }

  return response.json();
}

export async function getClanInfo(clanTag: string) {
  const formattedTag = formatTag(clanTag);
  const response = await fetch(
    `https://proxy.royaleapi.dev/v1/clans/${formattedTag}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
      },
      cache: "no-store", // Always fetch fresh data
    }
  );

  if (!response.ok) {
    const errorText = await response.text(); // Log the error body for more details
    console.error("Error response body:", errorText);
    throw new Error("Failed to fetch clan data");
  }

  return response.json();
}

export async function fetcher(url: string, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Api request failed: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
