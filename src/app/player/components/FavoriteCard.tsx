import { Player } from "../types";

interface FavoriteCardProps {
  player: Player;
}

export default function FavoriteCard({ player }: FavoriteCardProps) {
  const yearsPlayedBadge = player?.badges.find(
    (badge) => badge.name === "YearsPlayed"
  );

  return (
    <div className="flex items-center p-6 border-t border-gray-200 relative">
      <div className="mr-4">
        <img
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

      {/* Position the Years Played badge at the bottom-right */}
      {yearsPlayedBadge && (
        <div className="absolute bottom-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md border-b-5 border-r-5 border-b-gray-800 border-r-gray-700">
          <p className="text-xs">
            Account Age - {yearsPlayedBadge.level} years
          </p>
        </div>
      )}
    </div>
  );
}
