import React, { useState, useEffect } from "react";
import "../components/animation.css"; // You'll need to create this CSS file

interface DashboardPageProps {
  onExit?: () => void;
  onGamesClick?: () => void; // Add this prop
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  onExit,
  onGamesClick,
}) => {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleQuizPuzzles = () => {
    if (onGamesClick) {
      onGamesClick(); // Call the navigation function when "Quiz & Puzzles" is clicked
    }
  };

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
  }, []);

  // Get the avatar source based on the stored value
  const getAvatarSrc = () => {
    const selectedAvatar = avatarOptions.find((a) => a.value === avatar);
    return selectedAvatar ? selectedAvatar.src : "";
  };

  // Handle button clicks
  const handleScanExplore = () => {
    console.log("Scan & Explore clicked");
    // Add your functionality here
  };

  const handleLearnMore = () => {
    console.log("Learn More clicked");
    // Add your functionality here
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
    // You could also redirect to a different page here
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="welcome-text">Hello, {username}!</h2>
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
          <span className="btn-icon">🔍</span> Scan & Explore
        </button>
        <button className="dashboard-btn" onClick={handleQuizPuzzles}>
          <span className="btn-icon">🧩</span> Quiz & Puzzles
        </button>
        <button className="dashboard-btn" onClick={handleLearnMore}>
          <span className="btn-icon">📚</span> Learn More
        </button>
        <button className="dashboard-btn" onClick={handleExit}>
          <span className="btn-icon">🚪</span> Exit
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
