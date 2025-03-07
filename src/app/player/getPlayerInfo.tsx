"use client";
import { useState } from "react";
import { Player } from "./types"; // Import Player type
import PlayerCard from "./components/PlayerCard"; // Import reusable components
import PlayerStats from "./components/PlayerStats";
import FavoriteCard from "./components/FavoriteCard";

export default function PlayerSearch() {
  const [tag, setTag] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState("");

  async function fetchPlayer() {
    setError("");
    setPlayer(null);

    const formattedTag = tag.startsWith("#")
      ? `%23${tag.slice(1)}`
      : `%23${tag}`;

    try {
      const res = await fetch(`/api/player/${formattedTag}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch player data.");
      } else {
        setPlayer(data);
      }
    } catch {
      setError("Something went wrong.");
    }
  }

  if (!player) {
    return (
      <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
        <form action={fetchPlayer} className="mb-4">
          <input
            type="text"
            placeholder="Enter Player Tag (e.g. #ABC123)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="submit"
            value="search"
            onClick={fetchPlayer}
            className="w-full bg-blue-500 text-white p-2 rounded"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>{" "}
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl relative">
      <PlayerCard player={player} />
      <PlayerStats player={player} />
      <FavoriteCard player={player} />
    </div>
  );
}
