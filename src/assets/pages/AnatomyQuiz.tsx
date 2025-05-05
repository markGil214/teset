import React, { useState, useEffect } from "react";

interface AnatomyQuizProps {
  onBackToGames: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  image?: string;
}

const AnatomyQuiz: React.FC<AnatomyQuizProps> = ({ onBackToGames }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [quizStarted, setQuizStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

  // Sample questions - you would expand this with more real questions
  const questions: Record<string, Question[]> = {
    easy: [
      {
        id: 1,
        question: "Which organ pumps blood throughout the body?",
        options: ["Heart", "Lungs", "Liver", "Kidney"],
        correctAnswer: "Heart",
        image: "/heart.png",
      },
      {
        id: 2,
        question: "Which organ helps us breathe?",
        options: ["Brain", "Lungs", "Stomach", "Intestines"],
        correctAnswer: "Lungs",
        image: "/lungs.png",
      },
      {
        id: 3,
        question: "What is the largest organ in the human body?",
        options: ["Liver", "Brain", "Skin", "Heart"],
        correctAnswer: "Skin",
      },
      {
        id: 4,
        question: "Which organ filters waste from blood?",
        options: ["Kidney", "Stomach", "Liver", "Pancreas"],
        correctAnswer: "Kidney",
      },
      {
        id: 5,
        question: "Which part of the body controls thinking?",
        options: ["Heart", "Brain", "Lungs", "Spleen"],
        correctAnswer: "Brain",
      },
    ],
    medium: [
      {
        id: 1,
        question: "Which of these is NOT part of the digestive system?",
        options: ["Small intestine", "Stomach", "Lungs", "Esophagus"],
        correctAnswer: "Lungs",
      },
      {
        id: 2,
        question: "The pancreas produces which substance?",
        options: ["Bile", "Insulin", "Hydrochloric acid", "Saliva"],
        correctAnswer: "Insulin",
      },
      {
        id: 3,
        question: "How many chambers does the human heart have?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "4",
        image: "/heart.png",
      },
      {
        id: 4,
        question: "Which blood vessels carry blood away from the heart?",
        options: ["Veins", "Arteries", "Capillaries", "Venules"],
        correctAnswer: "Arteries",
      },
      {
        id: 5,
        question: "What is the main function of red blood cells?",
        options: [
          "Fight infection",
          "Carry oxygen",
          "Produce antibodies",
          "Clot blood",
        ],
        correctAnswer: "Carry oxygen",
      },
    ],
    hard: [
      {
        id: 1,
        question: "Which part of the nephron is responsible for filtration?",
        options: [
          "Loop of Henle",
          "Glomerulus",
          "Collecting duct",
          "Distal tubule",
        ],
        correctAnswer: "Glomerulus",
      },
      {
        id: 2,
        question: "Which cranial nerve controls eye movement?",
        options: ["Trigeminal", "Oculomotor", "Vagus", "Facial"],
        correctAnswer: "Oculomotor",
      },
      {
        id: 3,
        question:
          "What is the name of the protein that carries oxygen in red blood cells?",
        options: ["Myoglobin", "Hemoglobin", "Albumin", "Keratin"],
        correctAnswer: "Hemoglobin",
      },
      {
        id: 4,
        question:
          "Which part of the brain is responsible for balance and coordination?",
        options: ["Cerebellum", "Cerebrum", "Medulla", "Thalamus"],
        correctAnswer: "Cerebellum",
      },
      {
        id: 5,
        question:
          "What type of muscle tissue is found in the walls of blood vessels?",
        options: [
          "Cardiac muscle",
          "Skeletal muscle",
          "Smooth muscle",
          "Striated muscle",
        ],
        correctAnswer: "Smooth muscle",
      },
    ],
  };

  // Reset timer when question changes
  useEffect(() => {
    if (quizStarted && !showResult && !answerStatus) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswer("Time's up!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion, quizStarted, showResult, answerStatus]);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setAnswerStatus(null);
    setTimeLeft(15);
  };

  const handleAnswer = (selectedOption: string) => {
    const isCorrect =
      selectedOption === questions[difficulty][currentQuestion].correctAnswer;
    setSelectedAnswer(selectedOption);
    setAnswerStatus(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      // Add points based on time left - faster answers get more points
      const timeBonus = Math.max(0, timeLeft);
      setScore((prevScore) => prevScore + 10 + timeBonus);
    }

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < questions[difficulty].length - 1) {
        setCurrentQuestion((prevQuestion) => prevQuestion + 1);
        setSelectedAnswer(null);
        setAnswerStatus(null);
        setTimeLeft(15);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswerStatus(null);
    setTimeLeft(15);
    setQuizStarted(false);
  };

  const getScoreMessage = () => {
    const totalPossibleScore = questions[difficulty].length * 25; // 10 points + max 15 time bonus per question
    const percentage = (score / totalPossibleScore) * 100;

    if (percentage >= 90) return "Outstanding! You're an anatomy expert!";
    if (percentage >= 75) return "Great job! You know your anatomy well!";
    if (percentage >= 50) return "Good effort! Keep learning!";
    return "Keep studying! You'll get there!";
  };

  return (
    <div className="anatomy-quiz-container">
      <div className="game-header">
        <h1>Anatomy Quiz</h1>
        <p>Test your knowledge of human anatomy!</p>
      </div>

      {!quizStarted ? (
        <div className="difficulty-selection">
          <h2>Select Difficulty</h2>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-btn ${
                difficulty === "easy" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("easy")}
            >
              Easy
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "medium" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("medium")}
            >
              Medium
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "hard" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("hard")}
            >
              Hard
            </button>
          </div>
          <button className="start-game-btn" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      ) : showResult ? (
        <div className="game-complete">
          <h2>Quiz Complete!</h2>
          <p>Your score: {score}</p>
          <p>{getScoreMessage()}</p>
          <div className="game-complete-buttons">
            <button onClick={resetQuiz}>Play Again</button>
            <button onClick={onBackToGames}>Back to Games</button>
          </div>
        </div>
      ) : (
        <div className="quiz-content">
          <div className="quiz-stats">
            <div className="stat-item">
              Question: {currentQuestion + 1}/{questions[difficulty].length}
            </div>
            <div className="stat-item">Score: {score}</div>
            <div className="stat-item">Time: {timeLeft}s</div>
          </div>

          <div className="quiz-question-container">
            <div className="quiz-question">
              <h2>{questions[difficulty][currentQuestion].question}</h2>

              {questions[difficulty][currentQuestion].image && (
                <div className="question-image">
                  <img
                    src={questions[difficulty][currentQuestion].image}
                    alt="Question visual"
                  />
                </div>
              )}
            </div>

            <div className="quiz-options">
              {questions[difficulty][currentQuestion].options.map(
                (option, index) => (
                  <button
                    key={index}
                    onClick={() => !answerStatus && handleAnswer(option)}
                    className={`quiz-option ${
                      selectedAnswer === option
                        ? answerStatus === "correct"
                          ? "correct"
                          : "incorrect"
                        : ""
                    } ${
                      answerStatus &&
                      option ===
                        questions[difficulty][currentQuestion].correctAnswer
                        ? "correct"
                        : ""
                    }`}
                    disabled={!!answerStatus}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="game-controls">
            <button onClick={resetQuiz}>Restart Quiz</button>
            <button onClick={onBackToGames}>Back to Games</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnatomyQuiz;
