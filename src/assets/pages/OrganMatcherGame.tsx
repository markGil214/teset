import React, { useState, useEffect } from "react";
import "../components/animation.css";

interface OrganMatcherGameProps {
  onBackToGames: () => void;
}

// Updated Card interface to support translations
interface Card {
  id: number;
  type: "organ" | "function";
  content: {
    en: string;
    fil: string;
  };
  matchId: number;
  isFlipped: boolean;
  isMatched: boolean;
  image?: string;
}

// Translation object for UI elements
const translations = {
  en: {
    title: "Organ Matcher",
    subtitle: "Match each organ with its correct function!",
    selectDifficulty: "Select Difficulty",
    easy: "Easy (4 pairs)",
    medium: "Medium (6 pairs)",
    hard: "Hard (9 pairs)",
    startGame: "Start Game",
    moves: "Moves",
    matched: "Matched",
    score: "Score",
    congratulations: "Congratulations!",
    matchedAll: "You've matched all the organs with their functions!",
    finalScore: "Final Score",
    totalMoves: "Total Moves",
    playAgain: "Play Again",
    changeDifficulty: "Change Difficulty",
    backToGames: "Back to Games",
  },
  fil: {
    title: "Organ Matcher",
    subtitle: "Itugma ang bawat organ sa tamang tungkulin nito!",
    selectDifficulty: "Pumili ng Antas",
    easy: "Madali (4 na pares)",
    medium: "Katamtaman (6 na pares)",
    hard: "Mahirap (9 na pares)",
    startGame: "Simulan ang Laro",
    moves: "Mga Galaw",
    matched: "Nagtugma",
    score: "Iskor",
    congratulations: "Binabati kita!",
    matchedAll:
      "Naitugma mo na ang lahat ng mga organ sa kanilang mga tungkulin!",
    finalScore: "Huling Iskor",
    totalMoves: "Kabuuang Galaw",
    playAgain: "Maglaro Muli",
    changeDifficulty: "Baguhin ang Antas",
    backToGames: "Balik sa mga Laro",
  },
};

const OrganMatcherGame: React.FC<OrganMatcherGameProps> = ({
  onBackToGames,
}) => {
  // Add language state
  const [language, setLanguage] = useState<"en" | "fil">("en");

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [score, setScore] = useState<number>(0);

  // Load language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("userLanguage");
    if (savedLanguage === "fil") {
      setLanguage("fil");
    }
  }, []);

  // Get translations based on current language
  const t = translations[language];

  // Bilingual organ data with images and matching functions
  const organData = [
    {
      matchId: 1,
      organ: {
        image: "/brain.png",
      },
      function: {
        content: {
          en: "Brain",
          fil: "Utak",
        },
      },
    },
    {
      matchId: 2,
      organ: {
        image: "/heart.png",
      },
      function: {
        content: {
          en: "Heart",
          fil: "Puso",
        },
      },
    },
    {
      matchId: 3,
      organ: {
        image: "/lungs.png",
      },
      function: {
        content: {
          en: "Lungs",
          fil: "Baga",
        },
      },
    },
    {
      matchId: 4,
      organ: {
        image: "/stomach.png",
      },
      function: {
        content: {
          en: "Stomach",
          fil: "Tiyan",
        },
      },
    },
    {
      matchId: 5,
      organ: {
        image: "/liver.png",
      },
      function: {
        content: {
          en: "Liver",
          fil: "Atay",
        },
      },
    },
    {
      matchId: 6,
      organ: {
        image: "/kidneys.png",
      },
      function: {
        content: {
          en: "Kidneys",
          fil: "Bato",
        },
      },
    },
    {
      matchId: 7,
      organ: {
        image: "/intestines.png",
      },
      function: {
        content: {
          en: "Intestines",
          fil: "Bituka",
        },
      },
    },
    {
      matchId: 8,
      organ: {
        image: "/pancreas.png",
      },
      function: {
        content: {
          en: "Pancreas",
          fil: "Lapay",
        },
      },
    },
    {
      matchId: 9,
      organ: {
        image: "/skin.png",
      },
      function: {
        content: {
          en: "Skin",
          fil: "Balat",
        },
      },
    },
  ];

  // Initialize and shuffle cards
  const initializeGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    // Filter organ data by difficulty
    let pairsCount;
    switch (selectedDifficulty) {
      case "easy":
        pairsCount = 4;
        break;
      case "medium":
        pairsCount = 6;
        break;
      case "hard":
        pairsCount = 9;
        break;
      default:
        pairsCount = 4;
    }

    // Select a subset of organ data based on difficulty
    const selectedOrgans = [...organData].slice(0, pairsCount);

    // Create card pairs
    let cardPairs: Card[] = [];
    selectedOrgans.forEach((item, index) => {
      // Organ card
      cardPairs.push({
        id: index * 2,
        type: "organ",
        content: item.function.content, // Use the organ name for both
        matchId: item.matchId,
        isFlipped: false,
        isMatched: false,
        image: item.organ.image,
      });

      // Function card
      cardPairs.push({
        id: index * 2 + 1,
        type: "function",
        content: item.function.content,
        matchId: item.matchId,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
    setGameComplete(false);
    setGameStarted(true);
  };

  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore click if already two cards flipped or card already matched/flipped
    const clickedCard = cards.find((card) => card.id === id);
    if (
      flippedCards.length === 2 ||
      clickedCard?.isMatched ||
      clickedCard?.isFlipped ||
      flippedCards.includes(id)
    ) {
      return;
    }

    // Flip the card
    const updatedCards = cards.map((card) =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);

    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);

      const firstCardId = newFlippedCards[0];
      const secondCardId = newFlippedCards[1];

      const firstCard = updatedCards.find((card) => card.id === firstCardId);
      const secondCard = updatedCards.find((card) => card.id === secondCardId);

      // Check if cards match by matchId
      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // If matched, keep cards flipped and mark as matched
        setTimeout(() => {
          const matchedCards = updatedCards.map((card) =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true }
              : card
          );
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(matchedPairs + 1);

          // Add points to score (more points for fewer moves)
          const pointsForMatch = Math.max(10, 20 - moves);
          setScore(score + pointsForMatch);

          // Check if game is complete
          if (matchedPairs + 1 === updatedCards.length / 2) {
            setGameComplete(true);
          }
        }, 1000);
      } else {
        // If not matched, flip cards back
        setTimeout(() => {
          const resetCards = updatedCards.map((card) =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div
      className="organ-matcher-container"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#241245",
        position: "relative",
        minHeight: "100%",
        maxHeight: "100vh",
        padding: "0.5rem",
        color: "white",
      }}
    >
      <div
        className="game-header"
        style={{
          flexShrink: 0,
          padding: "0.5rem",
          textAlign: "center",
          color: "#f3d849",
          height: "auto",
          maxHeight: "15vh",
        }}
      >
        <h1
          style={{
            margin: "0",
            fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0 0",
            fontSize: "clamp(0.8rem, 2vw, 1rem)",
          }}
        >
          {t.subtitle}
        </p>
      </div>

      {!gameStarted ? (
        <div
          className="difficulty-selection"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            maxHeight: "85vh",
            padding: "0.5rem",
          }}
        >
          <h2
            style={{
              margin: "0.5rem 0",
              fontSize: "clamp(1.1rem, 3.5vw, 1.5rem)",
              color: "#f3d849",
            }}
          >
            {t.selectDifficulty}
          </h2>

          <div
            className="difficulty-buttons"
            style={{
              margin: "0.5rem 0",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <button
              className={`difficulty-btn ${
                difficulty === "easy" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("easy")}
              style={{
                minWidth: "80px",
                padding: "0.5rem 1rem",
                backgroundColor: difficulty === "easy" ? "#4285F4" : "#4a5dbd",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              {t.easy}
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "medium" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("medium")}
              style={{
                minWidth: "80px",
                padding: "0.5rem 1rem",
                backgroundColor:
                  difficulty === "medium" ? "#4285F4" : "#4a5dbd",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              {t.medium}
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "hard" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("hard")}
              style={{
                minWidth: "80px",
                padding: "0.5rem 1rem",
                backgroundColor: difficulty === "hard" ? "#4285F4" : "#4a5dbd",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              {t.hard}
            </button>
          </div>

          <button
            className="start-game-btn"
            onClick={() => initializeGame(difficulty)}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              backgroundColor: "#e78c11",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            {t.startGame}
          </button>
        </div>
      ) : (
        <>
          <div
            className="game-stats"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: "8px",
              marginBottom: "0.5rem",
              fontSize: "clamp(0.7rem, 2.5vw, 0.9rem)",
            }}
          >
            <div className="stat-item">
              {t.moves}: {moves}
            </div>
            <div className="stat-item">
              {t.matched}: {matchedPairs}/{cards.length / 2}
            </div>
            <div className="stat-item">
              {t.score}: {score}
            </div>
          </div>

          {gameComplete ? (
            <div
              className="game-complete"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                maxHeight: "85vh",
                padding: "0.5rem",
              }}
            >
              <h2
                style={{
                  margin: "0.5rem 0",
                  fontSize: "clamp(1.1rem, 3.5vw, 1.5rem)",
                  color: "#f3d849",
                }}
              >
                {t.congratulations}
              </h2>
              <p style={{ margin: "0.5rem 0", textAlign: "center" }}>
                {t.matchedAll}
              </p>
              <p style={{ margin: "0.5rem 0" }}>
                {t.finalScore}: {score}
              </p>
              <p style={{ margin: "0.5rem 0" }}>
                {t.totalMoves}: {moves}
              </p>
              <div
                className="game-complete-buttons"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  onClick={() => initializeGame(difficulty)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#e78c11",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {t.playAgain}
                </button>
                <button
                  onClick={onBackToGames}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#e78c11",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {t.backToGames}
                </button>
              </div>
            </div>
          ) : (
            // Updated game-board layout to ensure cards are fully visible

            <div
              className="game-board"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${
                  difficulty === "hard" ? 4 : 3
                }, 1fr)`,
                // Adjust row spacing and placement
                gridAutoRows: "1fr",
                gap: difficulty === "hard" ? "0.3rem" : "0.5rem",
                flex: 1,
                overflow: "visible", // Allow content to be visible
                padding: "0.25rem",
                // More flexible height calculation
                maxHeight: difficulty === "hard" ? "65vh" : "70vh", // Give more space for hard difficulty
                alignContent: "center",
                justifyContent: "center",
                margin: "0 auto",
                // Add grid row gap adjustment for different difficulties
                gridRowGap: difficulty === "hard" ? "0.3rem" : "0.4rem",
              }}
            >
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card ${
                    card.isFlipped || card.isMatched ? "flipped" : ""
                  } ${card.isMatched ? "matched" : ""} ${card.type}`}
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    backgroundColor: "#4a5dbd",
                    borderRadius: "8px",
                    aspectRatio: "1 / 1",
                    perspective: "1000px",
                    cursor: "pointer",
                    position: "relative",
                    transform: card.isMatched ? "scale(0.95)" : "scale(1)",
                    opacity: card.isMatched ? 0.8 : 1,
                    transition: "all 0.3s ease",
                    height:
                      difficulty === "hard"
                        ? "min(13vh, 90px)"
                        : difficulty === "medium"
                        ? "min(16vh, 110px)"
                        : "min(18vh, 130px)",
                    width: "100%",
                    maxWidth: "130px",
                    margin: "0 auto",
                  }}
                >
                  <div
                    className="card-inner"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      textAlign: "center",
                      transition: "transform 0.6s",
                      transformStyle: "preserve-3d",
                      transform:
                        card.isFlipped || card.isMatched
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                    }}
                  >
                    {/* Card front */}
                    <div
                      className="card-front"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "8px",
                        backgroundColor: "#4a5dbd",
                        color: "white",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        className="card-question-mark"
                        style={{
                          fontSize:
                            difficulty === "hard"
                              ? "clamp(1.2rem, 3vw, 2rem)"
                              : "clamp(1.5rem, 4vw, 2.5rem)",
                          fontWeight: "bold",
                        }}
                      >
                        ?
                      </div>
                    </div>

                    {/* Card back */}
                    <div
                      className="card-back"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: difficulty === "hard" ? "0.15rem" : "0.25rem",
                        borderRadius: "8px",
                        backgroundColor:
                          card.type === "organ" ? "#2ecc71" : "#e74c3c",
                        color: "white",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      {card.type === "organ" && card.image && (
                        <div
                          className="card-image"
                          style={{
                            width: difficulty === "hard" ? "50%" : "60%",
                            height: difficulty === "hard" ? "50%" : "60%",
                            marginBottom: "0.15rem",
                          }}
                        >
                          <img
                            src={card.image}
                            alt=""
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      )}
                      {card.type === "function" && (
                        <div
                          className="card-content"
                          style={{
                            fontSize:
                              difficulty === "hard"
                                ? "clamp(0.55rem, 1.5vw, 0.7rem)"
                                : "clamp(0.65rem, 1.8vw, 0.8rem)",
                            fontWeight: "bold",
                            textAlign: "center",
                            maxHeight: "2.2em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: "1.1em",
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          {card.content[language]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            className="game-controls"
            style={{
              marginTop: "auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              padding: "0.5rem 0",
            }}
          >
            <button
              onClick={() => {
                setGameStarted(false);
                setCards([]);
              }}
              style={{
                padding: "0.5rem",
                backgroundColor: "#e78c11",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
              }}
            >
              {t.changeDifficulty}
            </button>
            <button
              onClick={onBackToGames}
              style={{
                padding: "0.5rem",
                backgroundColor: "#e78c11",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
              }}
            >
              {t.backToGames}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganMatcherGame;
