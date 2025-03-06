import PlayerSearch from "./search";

export default function PlayerPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Player Lookup</h1>
      <PlayerSearch />
    </div>
  );
}

// import { getPlayerInfo } from "@/lib/clashRoyale";

// export default async function PlayerPage() {
//   const playerTag = "#908PRLR"; // Replace with actual tag or get from search params
//   const player = await getPlayerInfo(playerTag);

//   return (

//     <div>
//       <h1>Player: {player.name}</h1>
//       <p>Level: {player.expLevel}</p>
//       <p>Trophies: {player.trophies}</p>
//       <p>Clan: {player.clan?.name || "No Clan"}</p>
//     </div>
//   );
// }
