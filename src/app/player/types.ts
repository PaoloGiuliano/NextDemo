export interface Player {
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

export interface BattleLog {
  elixirLeaked: {
    team: number; // Elixir leaked by the player
    opponent: number; // Elixir leaked by the opponent
  };
  playerCards: {
    name: string;
    imageUrl: string;
  }[]; // Array of 8 cards used by the player
  opponentCards: {
    name: string;
    imageUrl: string;
  }[]; // Array of 8 cards used by the opponent
  team: {
    crowns: number; // Crowns earned by the player
  };
  opponent: {
    crowns: number; // Crowns earned by the opponent
  };
}
