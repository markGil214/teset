export function MainMenu() {
  return (
    <div className="p-4 grid gap-4">
      <button className="bg-yellow-400 p-4 rounded">Scan & Explore</button>
      <button className="bg-pink-500 p-4 rounded text-white">
        Quiz & Puzzles
      </button>
      <button className="bg-blue-400 p-4 rounded text-white">Learn More</button>
      <button className="bg-red-600 p-4 rounded text-white">Exit</button>
    </div>
  );
}
