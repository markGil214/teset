import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/animation.css";
import LearnMoreSection from "../components/LearnMore";

// Translations
const translations = {
  en: {
    welcome: "Hello",
    organQuest: "OrganQuest",
    scanExplore: "Scan & Explore",
    quizPuzzles: "Quiz & Puzzles",
    learnMore: "Learn More",
    exit: "Exit",
  },
  fil: {
    welcome: "Kamusta",
    organQuest: "OrganQuest",
    scanExplore: "I-Scan at Tumuklas",
    quizPuzzles: "Mga laro",
    learnMore: "Dagdag Kaalaman",
    exit: "Lumabas",
  },
};

interface HomePageProps {
  onExit?: () => void;
  onGamesClick?: () => void;
  // onARClick?: () => void; // Remove unused prop
}

const HomePage: React.FC<HomePageProps> = ({
  onExit,
  onGamesClick,
  // onARClick, // Remove unused prop
}) => {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [language, setLanguage] = useState<"en" | "fil">("en");
  const [showLearnMore, setShowLearnMore] = useState(false);
  const navigate = useNavigate();

  // Array of available avatar options matching those in RegisterPage
  const avatarOptions = [
    { value: "avatar1", src: "/images.png", alt: "Avatar 1" },
    { value: "avatar2", src: "/images (1).png", alt: "Avatar 2" },
    { value: "avatar3", src: "/images (2).png", alt: "Avatar 3" },
  ];

  useEffect(() => {
    // Parse cookies to get user information
    const cookies = document.cookie.split(";");
    const cookieObj: { [key: string]: string } = {};

    cookies.forEach((cookie) => {
      const [key, value] = cookie.trim().split("=");
      cookieObj[key] = value;
    });

    // Set the username and avatar from cookies
    if (cookieObj.reg_username) {
      setUsername(cookieObj.reg_username);
    }

    if (cookieObj.reg_avatar) {
      setAvatar(cookieObj.reg_avatar);
    }

    // Get language preference from localStorage
    const savedLanguage = localStorage.getItem("userLanguage");
    if (savedLanguage === "fil") {
      setLanguage("fil");
    }
  }, []);

  // Get the avatar source based on the stored value
  const getAvatarSrc = () => {
    const selectedAvatar = avatarOptions.find((a) => a.value === avatar);
    return selectedAvatar ? selectedAvatar.src : "";
  };

  // Handle button clicks
  const handleScanExplore = () => {
    navigate("/organ-selection");
  };

  const handleQuizPuzzles = () => {
    if (onGamesClick) {
      onGamesClick(); // Call the navigation function when "Quiz & Puzzles" is clicked
    }
  };

  const handleLearnMore = () => {
    // Show the Learn More modal when the button is clicked
    setShowLearnMore(true);
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
    // You could also redirect to a different page here
  };

  // Get translation based on current language
  const t = translations[language];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="welcome-text">
          {t.welcome}, {username}!
        </h2>
        {avatar && (
          <div className="avatar-container">
            <img
              src={getAvatarSrc()}
              alt="User Avatar"
              className="user-avatar"
            />
          </div>
        )}
      </div>

      <div className="logo-container">
        <div className="logo-blocks">
          <div className="block blue"></div>
          <div className="block orange"></div>
          <div className="block green"></div>
          <div className="block pink"></div>
        </div>
        <h1 className="logo-text">OrganQuest</h1>
      </div>

      <div className="dashboard-buttons">
        <button className="dashboard-btn" onClick={handleScanExplore}>
          <span className="btn-icon">🔍</span> {t.scanExplore}
        </button>
        <button className="dashboard-btn" onClick={handleQuizPuzzles}>
          <span className="btn-icon">🧩</span> {t.quizPuzzles}
        </button>
        <button className="dashboard-btn" onClick={handleLearnMore}>
          <span className="btn-icon">📚</span> {t.learnMore}
        </button>
        <button className="dashboard-btn" onClick={handleExit}>
          <span className="btn-icon">🚪</span> {t.exit}
        </button>
      </div>

      {/* Render the Learn More section when showLearnMore is true */}
      {showLearnMore && (
        <LearnMoreSection
          onClose={() => setShowLearnMore(false)}
          onStartLearning={() => {
            setShowLearnMore(false);
            // Navigate to games section when "Start Learning" is clicked
            if (onGamesClick) {
              onGamesClick();
            }
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
