import React, { useState } from "react";
import "../components/animation.css";

interface OrganMatcherGameProps {
  onBackToGames: () => void;
}

interface Card {
  id: number;
  type: "organ" | "function";
  content: string;
  matchId: number;
  isFlipped: boolean;
  isMatched: boolean;
  image?: string;
}

const OrganMatcherGame: React.FC<OrganMatcherGameProps> = ({
  onBackToGames,
}) => {
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

  // Organ data with images and matching functions
  const organData = [
    {
      matchId: 1,
      organ: { content: "Brain", image: "/brain.png" },
      function: {
        content: "Controls all body functions and processes information",
      },
    },
    {
      matchId: 2,
      organ: { content: "Heart", image: "/heart.png" },
      function: { content: "Pumps blood throughout the body" },
    },
    {
      matchId: 3,
      organ: { content: "Lungs", image: "/lungs.png" },
      function: { content: "Takes in oxygen and releases carbon dioxide" },
    },
    {
      matchId: 4,
      organ: { content: "Stomach", image: "/stomach.png" },
      function: { content: "Breaks down food for digestion" },
    },
    {
      matchId: 5,
      organ: { content: "Liver", image: "/liver.png" },
      function: { content: "Filters blood and produces proteins" },
    },
    {
      matchId: 6,
      organ: { content: "Kidneys", image: "/kidneys.png" },
      function: { content: "Filter waste from blood to make urine" },
    },
    {
      matchId: 7,
      organ: { content: "Intestines", image: "/intestines.png" },
      function: { content: "Absorbs nutrients from food" },
    },
    {
      matchId: 8,
      organ: { content: "Pancreas", image: "/pancreas.png" },
      function: { content: "Produces insulin to regulate blood sugar" },
    },
    {
      matchId: 9,
      organ: { content: "Skin", image: "/skin.png" },
      function: { content: "Protects the body and regulates temperature" },
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
        content: item.organ.content,
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
    <div className="organ-matcher-container">
      <div className="game-header">
        <h1>Organ Matcher</h1>
        <p>Match each organ with its correct function!</p>
      </div>

      {!gameStarted ? (
        <div className="difficulty-selection">
          <h2>Select Difficulty</h2>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-btn ${
                difficulty === "easy" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("easy")}
            >
              Easy (4 pairs)
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "medium" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("medium")}
            >
              Medium (6 pairs)
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "hard" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("hard")}
            >
              Hard (9 pairs)
            </button>
          </div>
          <button
            className="start-game-btn"
            onClick={() => initializeGame(difficulty)}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="game-stats">
            <div className="stat-item">Moves: {moves}</div>
            <div className="stat-item">
              Matched: {matchedPairs}/{cards.length / 2}
            </div>
            <div className="stat-item">Score: {score}</div>
          </div>

          {gameComplete ? (
            <div className="game-complete">
              <h2>Congratulations!</h2>
              <p>You've matched all the organs with their functions!</p>
              <p>Final Score: {score}</p>
              <p>Total Moves: {moves}</p>
              <div className="game-complete-buttons">
                <button onClick={() => initializeGame(difficulty)}>
                  Play Again
                </button>
                <button onClick={onBackToGames}>Back to Games</button>
              </div>
            </div>
          ) : (
            <div className="game-board">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card ${
                    card.isFlipped || card.isMatched ? "flipped" : ""
                  } ${card.isMatched ? "matched" : ""} ${card.type}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <div className="card-question-mark">?</div>
                    </div>
                    <div className="card-back">
                      {card.type === "organ" && card.image && (
                        <div className="card-image">
                          <img src={card.image} alt={card.content} />
                        </div>
                      )}
                      <div className="card-content">{card.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="game-controls">
            <button
              onClick={() => {
                setGameStarted(false);
                setCards([]);
              }}
            >
              Change Difficulty
            </button>
            <button onClick={onBackToGames}>Back to Games</button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganMatcherGame;
