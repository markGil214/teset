import { useEffect, useState } from "react";
import LoadingPage from "./assets/components/LoadingPage";
import GetStartedPage from "./assets/pages/GetStartedPage";
import RegisterPage from "./assets/pages/RegisterPage";
import SecondRegistrationPage from "./assets/pages/SecondRegistrationPage";
import DashboardPage from "./assets/pages/HomePage";
import GameSelectionPage from "./assets/pages/GameSelectionPage";
import Animation from "./assets/components/animation";
import OrganMatcherGame from "./assets/pages/OrganMatcherGame";
import LandscapeWrapper from "./assets/components/LandscapeWrapper";

function App() {
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [secondRegistrationComplete, setSecondRegistrationComplete] =
    useState(false);
  const [homepageLoading, setHomepageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // Track current page: "home", "games", "organMatcher", etc.
  const [username, setUsername] = useState("");

  // Helper function to check if a cookie exists
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : "";
  };

  useEffect(() => {
    // Check for registration cookies on app load
    const hasUsername = getCookie("reg_username");
    const hasAvatar = getCookie("reg_avatar");

    if (hasUsername) {
      setUsername(hasUsername);
    }

    if (hasUsername && hasAvatar) {
      setStarted(true);
      setRegistered(true);
      setSecondRegistrationComplete(true);
      setLoading(false); // Skip initial loading screen
    } else {
      // Only show loading screen for new users
      const timer = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Show loading when transitioning to homepage
  useEffect(() => {
    if (secondRegistrationComplete && !homepageLoading) {
      setHomepageLoading(true);
      const timer = setTimeout(() => {
        setHomepageLoading(false);
      }, 3000); // Show loading for 3 seconds before homepage
      return () => clearTimeout(timer);
    }
  }, [secondRegistrationComplete]);

  // Store app state in cookies when they change
  const handleStart = () => {
    setStarted(true);
    document.cookie = "app_started=true; path=/; max-age=86400";
  };

  const handleRegisterComplete = () => {
    setRegistered(true);
    document.cookie = "app_registered=true; path=/; max-age=86400";
  };

  const handleSecondRegistrationComplete = () => {
    setSecondRegistrationComplete(true);
    document.cookie = "app_completed=true; path=/; max-age=86400";
  };

  // Handle navigation between home and games
  const navigateToGames = () => {
    setCurrentPage("games");
  };

  const navigateToHome = () => {
    setCurrentPage("home");
  };

  const handleSelectGame = (gameId: string) => {
    setCurrentPage(gameId); // Set the page to the selected game
  };

  // Render the correct content based on registration state and current page
  const renderContent = () => {
    if (loading) {
      return <LoadingPage />;
    }

    if (!started) {
      return <GetStartedPage onStart={handleStart} />;
    }

    if (!registered) {
      return <RegisterPage onRegisterComplete={handleRegisterComplete} />;
    }

    if (!secondRegistrationComplete) {
      return (
        <SecondRegistrationPage
          onRegisterCompleted={handleSecondRegistrationComplete}
        />
      );
    }

    if (homepageLoading) {
      return <LoadingPage />; // Show loading before homepage
    }

    // User is fully registered, show the appropriate page
    switch (currentPage) {
      case "games":
        return (
          <GameSelectionPage
            onBackToHome={navigateToHome}
            onSelectGame={handleSelectGame}
            username={username}
          />
        );
      case "organ-matcher":
        // Placeholder for future game implementation
        return (
          <LandscapeWrapper onExit={() => setCurrentPage("games")}>
            <OrganMatcherGame onBackToGames={() => setCurrentPage("games")} />
          </LandscapeWrapper>
        );
      case "body-builder":
        // Placeholder for future game implementation
        return <div>Body System Builder Game (Coming Soon)</div>;
      case "anatomy-quiz":
        // Placeholder for future game implementation
        return <div>Anatomy Quiz Game (Coming Soon)</div>;
      case "home":
      default:
        return (
          <DashboardPage
            onExit={() => {
              // Optional: Clear cookies if you want to support logout
            }}
            onGamesClick={navigateToGames} // Add this prop to your DashboardPage component
          />
        );
    }
  };

  return (
    <div className="relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Animation />
      </div>
      <div className="z-20 pointer-events-auto">{renderContent()}</div>
    </div>
  );
}

export default App;
