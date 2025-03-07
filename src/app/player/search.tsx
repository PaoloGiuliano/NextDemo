"use client";

import { useState } from "react";
import Image from "next/image";

// Define the player data structure
interface Player {
  name: string;
  expLevel: number;
  trophies: number;
  wins: number;
  losses: number;
  threeCrownWins: number;
  clan?: {
    name: string;
  };
  badges: [
    {
      name: string;
      level: number;
    }
  ];
  currentFavouriteCard: {
    name: string;
    iconUrls: {
      medium: string;
      evolutionMedium: string;
    };
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
      const res = await fetch(`/api/player/${formattedTag}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch player data.");
      } else {
        setPlayer(data);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  }

  if (!player) {
    return (
      <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Search Player</h2>
        <div className="mb-4">
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
        </div>{" "}
      </div>
    );
  }
  const yearsPlayedBadge = player.badges.find(
    (badge) => badge.name === "YearsPlayed"
  );

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl relative">
      {/* Player Header: Name, Exp Level, and Trophies */}
      <div className="flex items-center p-6">
        <div className="mr-6">
          <h2 className="text-2xl font-bold text-gray-900">{player.name}</h2>
          <p className="text-sm text-gray-600">Level {player.expLevel}</p>
        </div>
        <div className="ml-auto">
          <div className="text-xl font-semibold text-amber-400">
            {player.trophies} Trophies
          </div>
        </div>
      </div>

      {/* Player's Clan Information */}
      {player.clan && (
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-600">Clan: {player.clan.name}</p>
        </div>
      )}

      {/* Player's Stats (Wins, Losses, and Three Crown Wins) */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-green-600">
            {player.wins}
          </h3>
          <p className="text-sm text-gray-600">Total Wins</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-red-600">
            {player.losses}
          </h3>
          <p className="text-sm text-gray-600">Total Losses</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-blue-700">
            {player.threeCrownWins}
          </h3>
          <p className="text-sm text-gray-600">Total 3-Crown Wins</p>
        </div>
      </div>

      {/* Player's Current Favourite Card */}
      <div className="flex items-center p-6 border-t border-gray-200">
        <div className="mr-4">
          <Image
            src={player.currentFavouriteCard.iconUrls.medium}
            alt={player.currentFavouriteCard.name}
            width={80}
            height={120}
            className="rounded-lg h-30"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {player.currentFavouriteCard.name}
          </h3>
          <p className="text-sm text-gray-600">Current Favourite Card</p>
        </div>
      </div>

      {/* Player's "Years Played" Badge (Positioned Bottom Right within Player Profile) */}
      {yearsPlayedBadge && (
        <div className="absolute bottom-4 right-4 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm">Years Played: {yearsPlayedBadge.level}</p>
        </div>
      )}
    </div>
  );
}
