import PlayerSearch from "./search";

export default function PlayerPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-6">
        <div className="flex justify-center items-center gap-8">
          <ul className="p-4 list-decimal">
            <p className="font-bold text-[20px] mb-4">Example Tags</p>
            <li>908PRLR</li>
            <li>98CJ8C09</li>
            <li>PY9L2LC</li>
            <li>C98JYRQ</li>
          </ul>
          <PlayerSearch />
        </div>
      </div>
    </div>
  );
}
