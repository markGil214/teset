import React, { useState, useEffect, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import HeartViewer from "../components/HeartModel";
import LungsViewer from "../components/LungsModel";
import SkinViewer from "../components/SkinModel";
import BrainViewer from "../components/BrainModel";
import KidneyViewer from "../components/KidneyModel";
import "../components/animation.css";

// UI translations
const translations = {
  en: {
    title: "Anatomy Quiz",
    subtitle: "Test your knowledge of human anatomy!",
    selectDifficulty: "Select Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    startQuiz: "Start Quiz",
    loading: "Loading...",
    loadingModels: "Loading 3D models...",
    quizComplete: "Quiz Complete!",
    yourScore: "Your score:",
    playAgain: "Play Again",
    backToGames: "Back to Games",
    question: "Q",
    score: "Score",
    time: "Time",
    restartQuiz: "Restart Quiz",
    timeUp: "Time's up!",
    scoreMessages: {
      excellent: "Outstanding! You're an anatomy expert!",
      good: "Great job! You know your anatomy well!",
      average: "Good effort! Keep learning!",
      poor: "Keep studying! You'll get there!",
    },
  },
  fil: {
    title: "Pagsusulit sa Anatomiya",
    subtitle: "Subukin ang iyong kaalaman sa anatomiya",
    selectDifficulty: "Pumili ng Antas",
    easy: "Madali",
    medium: "Katamtaman",
    hard: "Mahirap",
    startQuiz: "Simulan ang Pagsusulit",
    loading: "Naglo-load...",
    loadingModels: "Naglo-load ng 3D models...",
    quizComplete: "Tapos na ang Pagsusulit!",
    yourScore: "Iyong iskor:",
    playAgain: "Maglaro Muli",
    backToGames: "Bumalik sa mga Laro",
    question: "T",
    score: "Iskor",
    time: "Oras",
    restartQuiz: "I-restart ang Pagsusulit",
    timeUp: "Naubos na ang oras!",
    scoreMessages: {
      excellent: "Magaling! Ikaw ay isang eksperto sa anatomiya!",
      good: "Mahusay! Alam mo ang anatomiya nang mabuti!",
      average: "Magandang pagsisikap! Patuloy na mag-aral!",
      poor: "Ipagpatuloy ang pag-aaral! Makakaya mo rin iyan!",
    },
  },
};

// Define model paths for preloading
const modelPaths = {
  heart: "/realistic_human_heart/scene.gltf",
  lungs: "/lungs/scene.gltf",
  skin: "/skin/scene.gltf",
  kidney: "/kidney/scene.gltf",
  brain: "/brain/scene.gltf",
};

interface AnatomyQuizProps {
  onBackToGames: () => void;
}

// Updated Question interface to support translations
interface Question {
  id: number;
  question: {
    en: string;
    fil: string;
  };
  options: {
    en: string[];
    fil: string[];
  };
  correctAnswer: {
    en: string;
    fil: string;
  };
  image?: string;
  model?: string;
}

const AnatomyQuiz: React.FC<AnatomyQuizProps> = ({ onBackToGames }) => {
  // Language state
  const [language, setLanguage] = useState<"en" | "fil">("en");

  // Load language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("userLanguage");
    if (savedLanguage === "fil") {
      setLanguage("fil");
    }
  }, []);

  // Get translations based on current language
  const t = translations[language];

  // State variables
  const [isPreloading, setIsPreloading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
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

  // Bilingual questions
  const questions: Record<string, Question[]> = {
    easy: [
      {
        id: 1,
        question: {
          en: "Which organ pumps blood throughout the body?",
          fil: "Anong organ ang nagpupump ng dugo sa buong katawan?",
        },
        options: {
          en: ["Heart", "Lungs", "Liver", "Kidney"],
          fil: ["Puso", "Baga", "Atay", "Bato"],
        },
        correctAnswer: {
          en: "Heart",
          fil: "Puso",
        },
        model: "heart",
      },
      {
        id: 2,
        question: {
          en: "Which organ helps us breathe?",
          fil: "Anong organ ang tumutulong sa atin para huminga?",
        },
        options: {
          en: ["Brain", "Lungs", "Stomach", "Intestines"],
          fil: ["Utak", "Baga", "Tiyan", "Bituka"],
        },
        correctAnswer: {
          en: "Lungs",
          fil: "Baga",
        },
        model: "lungs",
      },
      {
        id: 3,
        question: {
          en: "What is the largest organ in the human body?",
          fil: "Ano ang pinakamalaking organ sa ating katawan?",
        },
        options: {
          en: ["Liver", "Brain", "Skin", "Heart"],
          fil: ["Atay", "Utak", "Balat", "Puso"],
        },
        correctAnswer: {
          en: "Skin",
          fil: "Balat",
        },
        model: "skin",
      },
      {
        id: 4,
        question: {
          en: "Which organ filters waste from blood?",
          fil: "Anong organ ang nagsasala ng dumi mula sa dugo?",
        },
        options: {
          en: ["Kidney", "Stomach", "Liver", "Pancreas"],
          fil: ["Bato", "Tiyan", "Atay", "Pankreas"],
        },
        correctAnswer: {
          en: "Kidney",
          fil: "Bato",
        },
        model: "kidney",
      },
      {
        id: 5,
        question: {
          en: "Which part of the body controls thinking?",
          fil: "Anong bahagi ng katawan ang kumokontrol sa pag-iisip?",
        },
        options: {
          en: ["Heart", "Brain", "Lungs", "Spleen"],
          fil: ["Puso", "Utak", "Baga", "Pali"],
        },
        correctAnswer: {
          en: "Brain",
          fil: "Utak",
        },
        model: "brain",
      },
    ],
    medium: [
      {
        id: 1,
        question: {
          en: "Which of these is NOT part of the digestive system?",
          fil: "Alin sa mga ito ang HINDI bahagi ng digestive system?",
        },
        options: {
          en: ["Small intestine", "Stomach", "Lungs", "Esophagus"],
          fil: ["Maliit na bituka", "Tiyan", "Baga", "Esophagus"],
        },
        correctAnswer: {
          en: "Lungs",
          fil: "Baga",
        },
        model: "lungs",
      },
      {
        id: 2,
        question: {
          en: "The pancreas produces which substance?",
          fil: "Anong substansya ang ginagawa ng pankreas (pancreas)?",
        },
        options: {
          en: ["Bile", "Insulin", "Hydrochloric acid", "Saliva"],
          fil: ["Bile", "Insulin", "Hydrochloric acid", "Laway"],
        },
        correctAnswer: {
          en: "Insulin",
          fil: "Insulin",
        },
        image: "/pancreas.png",
      },
      {
        id: 3,
        question: {
          en: "How many chambers does the human heart have?",
          fil: "Ilang chamber ang puso ng tao?",
        },
        options: {
          en: ["2", "3", "4", "5"],
          fil: ["2", "3", "4", "5"],
        },
        correctAnswer: {
          en: "4",
          fil: "4",
        },
        model: "heart",
      },
      {
        id: 4,
        question: {
          en: "Which blood vessels carry blood away from the heart?",
          fil: "Anong uri ng daluyan ng dugo ang nagdadala ng dugo palayo sa puso?",
        },
        options: {
          en: ["Veins", "Arteries", "Capillaries", "Venules"],
          fil: ["Ugat", "Arterya", "Capillary", "Venule"],
        },
        correctAnswer: {
          en: "Arteries",
          fil: "Arterya",
        },
        model: "heart",
      },
      {
        id: 5,
        question: {
          en: "What is the main function of red blood cells?",
          fil: "Ano ang pangunahing tungkulin ng red blood cells?",
        },
        options: {
          en: [
            "Fight infection",
            "Carry oxygen",
            "Produce antibodies",
            "Clot blood",
          ],
          fil: [
            "Labanan ang impeksyon",
            "Magdala ng oxygen",
            "Gumawa ng antibodies",
            "Pampaagulo ng dugo",
          ],
        },
        correctAnswer: {
          en: "Carry oxygen",
          fil: "Magdala ng oxygen",
        },
        image: "/rbc.png",
      },
    ],
    hard: [
      {
        id: 1,
        question: {
          en: "Which part of the nephron is responsible for filtration?",
          fil: "Aling bahagi ng nephron ang responsable sa pagsasala?",
        },
        options: {
          en: [
            "Loop of Henle",
            "Glomerulus",
            "Collecting duct",
            "Distal tubule",
          ],
          fil: [
            "Loop of Henle",
            "Glomerulus",
            "Collecting duct",
            "Distal tubule",
          ],
        },
        correctAnswer: {
          en: "Glomerulus",
          fil: "Glomerulus",
        },
        image: "/grume.png",
      },
      {
        id: 2,
        question: {
          en: "Which cranial nerve controls eye movement?",
          fil: "Aling cranial nerve ang kumokontrol sa paggalaw ng mata?",
        },
        options: {
          en: ["Trigeminal", "Oculomotor", "Vagus", "Facial"],
          fil: ["Trigeminal", "Oculomotor", "Vagus", "Facial"],
        },
        correctAnswer: {
          en: "Oculomotor",
          fil: "Oculomotor",
        },
      },
      {
        id: 3,
        question: {
          en: "What is the name of the protein that carries oxygen in red blood cells?",
          fil: "Ano ang pangalan ng protina na nagdadala ng oxygen sa red blood cells?",
        },
        options: {
          en: ["Myoglobin", "Hemoglobin", "Albumin", "Keratin"],
          fil: ["Myoglobin", "Hemoglobin", "Albumin", "Keratin"],
        },
        correctAnswer: {
          en: "Hemoglobin",
          fil: "Hemoglobin",
        },
      },
      {
        id: 4,
        question: {
          en: "Which part of the brain is responsible for balance and coordination?",
          fil: "Aling bahagi ng utak ang responsable sa balanse at koordinasyon?",
        },
        options: {
          en: ["Cerebellum", "Cerebrum", "Medulla", "Thalamus"],
          fil: ["Cerebellum", "Cerebrum", "Medulla", "Thalamus"],
        },
        correctAnswer: {
          en: "Cerebellum",
          fil: "Cerebellum",
        },
      },
      {
        id: 5,
        question: {
          en: "What type of muscle tissue is found in the walls of blood vessels?",
          fil: "Anong uri ng muscle tissue ang matatagpuan sa mga pader ng daluyan ng dugo?",
        },
        options: {
          en: [
            "Cardiac muscle",
            "Skeletal muscle",
            "Smooth muscle",
            "Striated muscle",
          ],
          fil: [
            "Cardiac muscle",
            "Skeletal muscle",
            "Smooth muscle",
            "Striated muscle",
          ],
        },
        correctAnswer: {
          en: "Smooth muscle",
          fil: "Smooth muscle",
        },
      },
    ],
  };

  // Preload all models function
  const preloadModels = async () => {
    setLoadingProgress(0);
    let loaded = 0;
    const totalModels = Object.keys(modelPaths).length;

    try {
      // Load each model sequentially to prevent overwhelming the browser
      for (const [key, path] of Object.entries(modelPaths)) {
        try {
          await new Promise<void>((resolve) => {
            // Use setTimeout to give the browser breathing room between loads
            setTimeout(() => {
              try {
                useGLTF.preload(path);
                console.log(`Preloaded: ${key}`);
              } catch (e) {
                console.error(`Failed to preload ${key} model:`, e);
              }
              loaded++;
              setLoadingProgress(Math.floor((loaded / totalModels) * 100));
              resolve();
            }, 300); // Slight delay between each preload
          });
        } catch (e) {
          console.error(`Error loading ${key}:`, e);
        }
      }
      setModelsLoaded(true);
    } catch (e) {
      console.error("Error preloading models:", e);
      setModelsLoaded(true); // Still set as loaded to continue with fallbacks
    }
  };

  // Modified startQuiz function to preload models first
  const startQuiz = () => {
    setIsPreloading(true);

    // Use Promise to ensure preloading completes before starting quiz
    preloadModels().then(() => {
      setQuizStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setAnswerStatus(null);
      setTimeLeft(15);
      setIsPreloading(false);
    });
  };

  // Modified timer useEffect to only start after models are loaded
  useEffect(() => {
    if (quizStarted && !showResult && !answerStatus && modelsLoaded) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswer(t.timeUp);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    currentQuestion,
    quizStarted,
    showResult,
    answerStatus,
    modelsLoaded,
    t.timeUp,
  ]);

  // Updated to handle translated answers
  const handleAnswer = (selectedOption: string) => {
    const isCorrect =
      selectedOption ===
      questions[difficulty][currentQuestion].correctAnswer[language];
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
    setModelsLoaded(false); // Reset the models loaded state
  };

  const getScoreMessage = () => {
    const totalPossibleScore = questions[difficulty].length * 25; // 10 points + max 15 time bonus per question
    const percentage = (score / totalPossibleScore) * 100;

    if (percentage >= 90) return t.scoreMessages.excellent;
    if (percentage >= 75) return t.scoreMessages.good;
    if (percentage >= 50) return t.scoreMessages.average;
    return t.scoreMessages.poor;
  };

  return (
    <div
      className="anatomy-quiz-container"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#241245",
        position: "relative",
        minHeight: "100%",
        maxHeight: "100vh",
      }}
    >
      {/* Header - With translations */}
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

      {!quizStarted ? (
        /* Difficulty selection screen with translations */
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
              style={{ minWidth: "80px", padding: "0.5rem 1rem" }}
              disabled={isPreloading}
            >
              {t.easy}
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "medium" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("medium")}
              style={{ minWidth: "80px", padding: "0.5rem 1rem" }}
              disabled={isPreloading}
            >
              {t.medium}
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === "hard" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("hard")}
              style={{ minWidth: "80px", padding: "0.5rem 1rem" }}
              disabled={isPreloading}
            >
              {t.hard}
            </button>
          </div>

          <button
            className="start-game-btn"
            onClick={startQuiz}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              opacity: isPreloading ? 0.7 : 1,
              cursor: isPreloading ? "wait" : "pointer",
            }}
            disabled={isPreloading}
          >
            {isPreloading ? t.loading : t.startQuiz}
          </button>

          {/* Loading progress bar with translations */}
          {isPreloading && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <div
                style={{
                  width: "200px",
                  height: "10px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "5px",
                  overflow: "hidden",
                  margin: "0.5rem auto",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${loadingProgress}%`,
                    backgroundColor: "#f3d849",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "#f3d849" }}>
                {t.loadingModels} {loadingProgress}%
              </p>
            </div>
          )}
        </div>
      ) : isPreloading ? (
        /* Loading screen with translations */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            maxHeight: "85vh",
          }}
        >
          <div
            className="spinner"
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(243, 216, 73, 0.3)",
              borderRadius: "50%",
              borderTop: "4px solid #f3d849",
              animation: "spin 1s ease-in-out infinite",
              marginBottom: "1rem",
            }}
          />
          <p style={{ color: "#f3d849" }}>
            {t.loadingModels} {loadingProgress}%
          </p>
        </div>
      ) : showResult ? (
        /* Results screen with translations */
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
            }}
          >
            {t.quizComplete}
          </h2>
          <p style={{ margin: "0.5rem 0" }}>
            {t.yourScore} {score}
          </p>
          <p
            style={{
              margin: "0.5rem 0",
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            {getScoreMessage()}
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
            <button onClick={resetQuiz} style={{ padding: "0.5rem 1rem" }}>
              {t.playAgain}
            </button>
            <button onClick={onBackToGames} style={{ padding: "0.5rem 1rem" }}>
              {t.backToGames}
            </button>
          </div>
        </div>
      ) : (
        /* Quiz questions screen with translations */
        <div
          className="quiz-content"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "0 0.5rem",
            maxHeight: "85vh",
            justifyContent: "space-between",
          }}
        >
          {/* Stats bar with translations */}
          <div
            className="quiz-stats"
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
              {t.question}: {currentQuestion + 1}/{questions[difficulty].length}
            </div>
            <div className="stat-item">
              {t.score}: {score}
            </div>
            <div className="stat-item">
              {t.time}: {timeLeft}s
            </div>
          </div>

          {/* Question area - Now with translated questions */}
          <div
            className="quiz-question"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#f3d849",
              flexGrow: 0,
              maxHeight: "40vh",
            }}
          >
            {/* Question text - now translated */}
            <h2
              style={{
                textAlign: "center",
                margin: "0 0 0.5rem 0",
                fontSize: "clamp(0.9rem, 3vw, 1.2rem)",
                padding: "0 0.5rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                maxHeight: "2.8rem",
              }}
            >
              {questions[difficulty][currentQuestion].question[language]}
            </h2>

            {/* Model/image rendering - unchanged */}
            {questions[difficulty][currentQuestion].model === "heart" ? (
              <div
                style={{
                  height: "15em",
                  marginTop: "1em",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              >
                <Suspense
                  fallback={
                    <div
                      style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.loading}
                    </div>
                  }
                >
                  <HeartViewer width="100%" height="100%" />
                </Suspense>
              </div>
            ) : questions[difficulty][currentQuestion].model === "lungs" ? (
              <div
                style={{
                  height: "15em",
                  marginTop: "1em",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              >
                <Suspense
                  fallback={
                    <div
                      style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.loading}
                    </div>
                  }
                >
                  <LungsViewer width="100%" height="100%" />
                </Suspense>
              </div>
            ) : questions[difficulty][currentQuestion].model === "skin" ? (
              <div
                style={{
                  height: "15em",
                  marginTop: "1em",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              >
                <Suspense
                  fallback={
                    <div
                      style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.loading}
                    </div>
                  }
                >
                  <SkinViewer width="100%" height="100%" />
                </Suspense>
              </div>
            ) : questions[difficulty][currentQuestion].model === "kidney" ? (
              <div
                style={{
                  height: "15em",
                  marginTop: "1em",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              >
                <Suspense
                  fallback={
                    <div
                      style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.loading}
                    </div>
                  }
                >
                  <KidneyViewer width="100%" height="100%" />
                </Suspense>
              </div>
            ) : questions[difficulty][currentQuestion].model === "brain" ? (
              <div
                style={{
                  height: "15em",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              >
                <Suspense
                  fallback={
                    <div
                      style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.loading}
                    </div>
                  }
                >
                  <BrainViewer width="100%" height="100%" />
                </Suspense>
              </div>
            ) : questions[difficulty][currentQuestion].image ? (
              <div
                style={{
                  height: "15em",
                  width: "100%",
                  marginTop: "1em",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={questions[difficulty][currentQuestion].image}
                  alt="Question"
                  style={{
                    height: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div style={{ height: "5vh" }} /> // Spacer when no visual
            )}
          </div>

          {/* Answer options - Now with translated options */}
          <div
            className="quiz-options"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "0.5rem",
              padding: "0 0.25rem",
              marginTop: "auto",
              marginBottom: "0.5rem",
              maxHeight: "35vh",
            }}
          >
            {questions[difficulty][currentQuestion].options[language].map(
              (option, index) => {
                // Answer button styling logic - updated for translations
                const isSelected = selectedAnswer === option;
                const isCorrect =
                  option ===
                  questions[difficulty][currentQuestion].correctAnswer[
                    language
                  ];

                let backgroundColor = "#4a5dbd";

                if (answerStatus) {
                  if (isCorrect) {
                    backgroundColor = "#2ecc71";
                  } else if (isSelected) {
                    backgroundColor = "#e74c3c";
                  } else {
                    backgroundColor = "rgba(74, 93, 189, 0.5)";
                  }
                }

                const border = isSelected
                  ? `3px solid ${isCorrect ? "#27ae60" : "#c0392b"}`
                  : "none";

                return (
                  <button
                    key={index}
                    onClick={() => !answerStatus && handleAnswer(option)}
                    disabled={!!answerStatus}
                    style={{
                      padding: "0.5rem",
                      backgroundColor,
                      color: "white",
                      border,
                      borderRadius: "4px",
                      fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                      cursor: !answerStatus ? "pointer" : "default",
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      transition: "all 0.3s ease",
                      boxShadow: isSelected
                        ? "0 2px 8px rgba(0,0,0,0.3)"
                        : "none",
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {option}
                    {answerStatus && (isSelected || isCorrect) && (
                      <span style={{ marginLeft: "8px" }}>
                        {isCorrect ? "✓" : isSelected ? "✗" : ""}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Control buttons with translations */}
          <div
            className="game-controls"
            style={{
              marginTop: "auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              padding: "0.5rem 0 0.75rem 0",
              flexShrink: 0,
            }}
          >
            <button
              onClick={resetQuiz}
              style={{
                padding: "0.5rem",
                backgroundColor: "#e78c11",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
              }}
            >
              {t.restartQuiz}
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
        </div>
      )}
    </div>
  );
};

export default AnatomyQuiz;
