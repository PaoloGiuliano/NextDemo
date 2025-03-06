"use client";

import { useState } from "react";

// Define the player data structure
interface Player {
  name: string;
  expLevel: number;
  trophies: number;
  clan?: {
    name: string;
  };
}

export default function PlayerSearch() {
  const [tag, setTag] = useState("");
  const [player, setPlayer] = useState<Player | null>(null); // Use the Player type here
  const [error, setError] = useState("");

  async function fetchPlayer() {
    setError("");
    setPlayer(null);

    const formattedTag = tag.startsWith("#")
      ? `%23${tag.slice(1)}`
      : `%23${tag}`;

    try {
      const res = await fetch(`/api/player?tag=${formattedTag}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch player data.");
      } else {
        setPlayer(data);
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Search Player</h2>
      <input
        type="text"
        placeholder="Enter Player Tag (e.g. #ABC123)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={fetchPlayer}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Search
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {player && (
        <div className="mt-4 border p-4 rounded shadow">
          <h3 className="text-lg font-semibold">{player.name}</h3>
          <p>Level: {player.expLevel}</p>
          <p>Trophies: {player.trophies}</p>
          <p>Clan: {player.clan?.name || "No Clan"}</p>
        </div>
      )}
    </div>
  );
}
