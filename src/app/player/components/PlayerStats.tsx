import { Player } from "../types";

interface PlayerStatsProps {
  player: Player;
}

export default function PlayerStats({ player }: PlayerStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-4 border-t border-gray-200">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-green-600">{player.wins}</h3>
        <p className="text-sm text-gray-600">Total Wins</p>
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-red-600">{player.losses}</h3>
        <p className="text-sm text-gray-600">Total Losses</p>
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-blue-700">
          {player.threeCrownWins}
        </h3>
        <p className="text-sm text-gray-600">Total 3-Crown Wins</p>
      </div>
    </div>
  );
}
