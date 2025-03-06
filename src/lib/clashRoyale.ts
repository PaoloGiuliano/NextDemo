export async function getPlayerInfo(playerTag: string) {
  // process.env.CLASH_ROYALE_API_KEY
  const apikey =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6Ijk2MTUxYjY3LTg5NDMtNDM2Yi1hZjQzLWQwYmI0NjRjNmI4OCIsImlhdCI6MTc0MTI3NjQ1NCwic3ViIjoiZGV2ZWxvcGVyL2FlMjcxZjcwLTc3NzMtZWViYS0zNmViLTg2Mjk5ODA3MWMwZiIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI3Mi4xMzguNC4xOTQiXSwidHlwZSI6ImNsaWVudCJ9XX0.GR0AtkOOLwAqKMb5LxSwRNtQ9dkjss-uFmhH1Lyv57PHGBATjvC786NG7vD0AI-GnM6CuBuhPHP1H7eHp6UTWg";
  // if player tag doesnt start with '#' add it first
  const formattedTag = "%23" + playerTag.replace(/#/g, "").toUpperCase();
  const res = await fetch(
    `https://api.clashroyale.com/v1/players/${formattedTag}`,
    {
      headers: {
        Authorization: `Bearer ${apikey}`,
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
