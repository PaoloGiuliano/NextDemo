import PlayerSearch from "./getPlayerInfo";

export default function PlayerPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen relative">
      <h1 className="text-5xl p-3">Player Search</h1>
      <PlayerSearch />

      {/* Example tags positioned at the bottom-right */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        <p>Example Tags:</p>
        <ul className="list-disc pl-5">
          <li>908PRLR</li>
          <li>98CJ8C09</li>
          <li>PY9L2LC</li>
          <li>C98JYRQ</li>
        </ul>
      </div>
    </div>
  );
}
