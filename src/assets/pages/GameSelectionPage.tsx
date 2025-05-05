import React, { useState, useEffect } from "react";

interface GameSelectionPageProps {
  onBackToHome: () => void;
  onSelectGame: (game: string) => void;
  username?: string;
}

const GameSelectionPage: React.FC<GameSelectionPageProps> = ({
  onBackToHome,
  onSelectGame,
  username = "",
}) => {
  // For animation effects when hovering games
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  // Parse username from cookies if not provided
  useEffect(() => {
    if (!username) {
      const cookies = document.cookie.split(";");
      const usernameCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("reg_username=")
      );
      if (usernameCookie) {
        const value = usernameCookie.split("=")[1];
        if (value) {
          username = decodeURIComponent(value);
        }
      }
    }
  }, [username]);

  const games = [
    {
      id: "organ-matcher",
      title: "Organ Matcher",
      description: "Match organs with their functions in this memory game",
      icon: "🧠",
      color: "#4a5dbd",
    },
    {
      id: "body-builder",
      title: "Body System Builder",
      description: "Place organs in their correct positions",
      icon: "❤️",
      color: "#ff3f80",
    },
    {
      id: "anatomy-quiz",
      title: "Anatomy Quiz",
      description: "Test your knowledge of human anatomy",
      icon: "📋",
      color: "#3cb043",
    },
  ];

  // Update the return statement in your GameSelectionPage component

  return (
    <div className="game-selection-container">
      <div className="game-selection-header">
        <h1>Choose a Game</h1>
        <p>Hello, {username}! What would you like to play today?</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className={`game-card ${hoveredGame === game.id ? "hovered" : ""}`}
            style={{ backgroundColor: game.color }}
            onClick={() => onSelectGame(game.id)}
            onMouseEnter={() => setHoveredGame(game.id)}
            onMouseLeave={() => setHoveredGame(null)}
            onTouchStart={() => setHoveredGame(game.id)}
          >
            <div className="game-icon">{game.icon}</div>
            <div className="game-title">{game.title}</div>
            <div className="game-description">{game.description}</div>
          </div>
        ))}
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={onBackToHome}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default GameSelectionPage;
