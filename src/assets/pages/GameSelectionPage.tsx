import React, { useState, useEffect } from "react";

// Translations
const translations = {
  en: {
    chooseGame: "Choose a Game",
    greeting: "Hello",
    whatToPlay: "What would you like to play today?",
    backToDashboard: "Back to Dashboard",
    games: {
      organMatcher: {
        title: "Organ Matcher",
        description: "Match organs with their functions",
      },
      bodyBuilder: {
        title: "Body System Builder",
        description: "Place organs in their correct positions",
      },
      anatomyQuiz: {
        title: "Anatomy Quiz",
        description: "Test your knowledge of human anatomy",
      },
    },
  },
  fil: {
    chooseGame: "Pumili ng Laro",
    greeting: "Kamusta",
    whatToPlay: "Anong gusto mong laruin ngayon?",
    backToDashboard: "Bumalik sa Dashboard",
    games: {
      organMatcher: {
        title: "Organ Matcher",
        description: "Itugma ang mga organs sa kanilang tungkulin",
      },
      bodyBuilder: {
        title: "Tagapagtayo ng Sistema",
        description: "Ilagay ang mga organs sa tamang posisyon",
      },
      anatomyQuiz: {
        title: "Pagsusulit sa Anatomiya",
        description: "Subukin ang iyong kaalaman sa anatomiya",
      },
    },
  },
};

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
  const [language, setLanguage] = useState<"en" | "fil">("en");
  const [currentUsername, setCurrentUsername] = useState(username);

  // Get language preference and username
  useEffect(() => {
    // Get language preference from localStorage
    const savedLanguage = localStorage.getItem("userLanguage");
    if (savedLanguage === "fil") {
      setLanguage("fil");
    }

    // Parse username from cookies if not provided
    if (!currentUsername) {
      const cookies = document.cookie.split(";");
      const usernameCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("reg_username=")
      );
      if (usernameCookie) {
        const value = usernameCookie.split("=")[1];
        if (value) {
          setCurrentUsername(decodeURIComponent(value));
        }
      }
    }
  }, [currentUsername]);

  // Get translation based on current language
  const t = translations[language];

  const games = [
    {
      id: "organ-matcher",
      title: t.games.organMatcher.title,
      description: t.games.organMatcher.description,
      icon: "🧠",
      color: "#4a5dbd",
    },
    {
      id: "body-builder",
      title: t.games.bodyBuilder.title,
      description: t.games.bodyBuilder.description,
      icon: "❤️",
      color: "#ff3f80",
    },
    {
      id: "anatomy-quiz",
      title: t.games.anatomyQuiz.title,
      description: t.games.anatomyQuiz.description,
      icon: "📋",
      color: "#3cb043",
    },
  ];

  return (
    <div
      className="game-selection-container"
      style={{
        height: "100vh" /* Full viewport height */,
        maxHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden" /* Prevent scrolling */,
        padding: "clamp(0.5rem, 2vw, 1.5rem)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="game-selection-header"
        style={{
          flexShrink: 0,
          padding: "clamp(0.5rem, 1.5vw, 1rem) 0",
        }}
      >
        <h1
          style={{
            margin: "0 0 clamp(0.2rem, 1vw, 0.5rem) 0",
            fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
          }}
        >
          {t.chooseGame}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
          }}
        >
          {t.greeting}, {currentUsername}! {t.whatToPlay}
        </p>
      </div>

      <div
        className="games-grid"
        style={{
          flex: "1 1 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "clamp(0.5rem, 3vw, 1.5rem)",
          padding: "clamp(0.5rem, 2vw, 1rem) 0",
          alignContent:
            "center" /* Center cards vertically in available space */,
          maxHeight: "calc(100vh - 180px)" /* Prevent overflow */,
          overflow: "hidden",
        }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            className={`game-card ${hoveredGame === game.id ? "hovered" : ""}`}
            style={{
              backgroundColor: game.color,
              borderRadius: "clamp(0.5rem, 2vw, 1rem)",
              padding: "clamp(0.8rem, 3vw, 1.5rem)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.3s ease",
              transform: hoveredGame === game.id ? "scale(1.03)" : "scale(1)",
              height: "100%",
              maxHeight: "clamp(180px, 30vh, 250px)",
              boxSizing: "border-box",
            }}
            onClick={() => onSelectGame(game.id)}
            onMouseEnter={() => setHoveredGame(game.id)}
            onMouseLeave={() => setHoveredGame(null)}
            onTouchStart={() => setHoveredGame(game.id)}
          >
            <div
              className="game-icon"
              style={{
                fontSize: "clamp(2rem, 6vw, 3rem)",
                marginBottom: "clamp(0.3rem, 1vw, 0.8rem)",
              }}
            >
              {game.icon}
            </div>
            <div
              className="game-title"
              style={{
                fontWeight: "bold",
                fontSize: "clamp(1rem, 3vw, 1.4rem)",
                marginBottom: "clamp(0.2rem, 0.8vw, 0.5rem)",
                textAlign: "center",
              }}
            >
              {game.title}
            </div>
            <div
              className="game-description"
              style={{
                fontSize: "clamp(0.8rem, 2vw, 1rem)",
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {game.description}
            </div>
          </div>
        ))}
      </div>

      <div
        className="back-button-container"
        style={{
          flexShrink: 0,
          padding: "clamp(0.5rem, 1.5vw, 1rem) 0",
          textAlign: "center",
        }}
      >
        <button
          className="back-button"
          onClick={onBackToHome}
          style={{
            padding: "clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 2rem)",
            fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
            borderRadius: "clamp(0.3rem, 1vw, 0.5rem)",
            border: "none",
            backgroundColor: "#e78c11",
            color: "white",
            cursor: "pointer",
          }}
        >
          {t.backToDashboard}
        </button>
      </div>
    </div>
  );
};

export default GameSelectionPage;
