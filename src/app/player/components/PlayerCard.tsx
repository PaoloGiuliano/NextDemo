import { Player } from "../types";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
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
  );
}
