import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import LoadingPage from "./assets/components/LoadingPage";
import GetStartedPage from "./assets/pages/GetStartedPage";
import RegisterPage from "./assets/pages/RegisterPage";
import SecondRegistrationPage from "./assets/pages/SecondRegistrationPage";
import HomePage from "./assets/pages/HomePage";
import GameSelectionPage from "./assets/pages/GameSelectionPage";
import Animation from "./assets/components/animation";
import OrganMatcherGame from "./assets/pages/OrganMatcherGame";
import LandscapeWrapper from "./assets/components/LandscapeWrapper";
import AnatomyQuiz from "./assets/pages/AnatomyQuiz";
import OrganDetailPage from "./assets/pages/OrganDetailPage";
import SlicedHeartPage from "./assets/pages/SlicedHeartPage";
import OrganSelectionPage from "./assets/pages/OrganSelectionPage";

// Main App wrapper that provides the Router context
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// AppContent component that contains all the logic
function AppContent() {
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [secondRegistrationComplete, setSecondRegistrationComplete] =
    useState(false);
  const [homepageLoading, setHomepageLoading] = useState(false);
  const [username, setUsername] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check if a cookie exists
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : "";
  };

  const shouldShowAnimation = () => {
    // Only show animation during loading and registration screens
    return (
      loading ||
      !started ||
      !registered ||
      !secondRegistrationComplete ||
      homepageLoading
    );
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

      // If user is already registered and on the root path, redirect to home
      if (location.pathname === "/") {
        navigate("/home");
      }
    } else {
      // Only show loading screen for new users
      const timer = setTimeout(() => {
        setLoading(false);
        if (location.pathname === "/") {
          navigate("/get-started");
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Show loading when transitioning to homepage
  useEffect(() => {
    if (secondRegistrationComplete && !homepageLoading) {
      setHomepageLoading(true);

      const timer = setTimeout(() => {
        setHomepageLoading(false);
        navigate("/home");
      }, 3000); // Show loading for 3 seconds before homepage

      return () => clearTimeout(timer);
    }
  }, [secondRegistrationComplete]);

  // Store app state in cookies when they change
  const handleStart = () => {
    setStarted(true);
    document.cookie = "app_started=true; path=/; max-age=86400";
    navigate("/register");
  };

  const handleRegisterComplete = () => {
    setRegistered(true);
    document.cookie = "app_registered=true; path=/; max-age=86400";
    navigate("/register-second");
  };

  const handleSecondRegistrationComplete = () => {
    setSecondRegistrationComplete(true);
    document.cookie = "app_completed=true; path=/; max-age=86400";
    // The homepage will be loaded via the useEffect
  };

  const navigateToGames = () => {
    navigate("/games");
  };

  const navigateToHome = () => {
    navigate("/home");
  };

  const handleSelectGame = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  // Render the correct content based on loading state
  if (loading) {
    return (
      <div className="relative">
        {shouldShowAnimation() && (
          <div className="fixed inset-0 z-0 pointer-events-none">
            <Animation />
          </div>
        )}
        <div className="z-20 pointer-events-auto">
          <LoadingPage />
        </div>
      </div>
    );
  }

  if (homepageLoading) {
    return (
      <div className="relative">
        {shouldShowAnimation() && (
          <div className="fixed inset-0 z-0 pointer-events-none">
            <Animation />
          </div>
        )}
        <div className="z-20 pointer-events-auto">
          <LoadingPage />
        </div>
      </div>
    );
  }

  // Option 1: Create a wrapper component that loads your HTML file
  const ARScannerPage = () => {
    return (
      <iframe
        src="/ARScannerPage.html"
        style={{
          width: "100vw",
          height: "100vh",
          border: "none",
          position: "fixed",
          top: 0,
          left: 0,
        }}
        title="AR Scanner"
      />
    );
  };

  return (
    <div className="relative">
      {shouldShowAnimation() && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Animation />
        </div>
      )}
      <div className="z-20 pointer-events-auto">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={started ? "/home" : "/get-started"} />}
          />
          <Route
            path="/get-started"
            element={
              !started ? (
                <GetStartedPage onStart={handleStart} />
              ) : (
                <Navigate to="/register" />
              )
            }
          />
          <Route
            path="/register"
            element={
              started && !registered ? (
                <RegisterPage onRegisterComplete={handleRegisterComplete} />
              ) : registered ? (
                <Navigate to="/register-second" />
              ) : (
                <Navigate to="/get-started" />
              )
            }
          />
          <Route
            path="/register-second"
            element={
              registered && !secondRegistrationComplete ? (
                <SecondRegistrationPage
                  onRegisterCompleted={handleSecondRegistrationComplete}
                />
              ) : secondRegistrationComplete ? (
                <Navigate to="/home" />
              ) : (
                <Navigate to="/register" />
              )
            }
          />
          <Route
            path="/home"
            element={
              secondRegistrationComplete ? (
                <HomePage onExit={() => {}} onGamesClick={navigateToGames} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/organ-selection"
            element={
              secondRegistrationComplete ? (
                <OrganSelectionPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/games"
            element={
              secondRegistrationComplete ? (
                <GameSelectionPage
                  onBackToHome={navigateToHome}
                  onSelectGame={handleSelectGame}
                  username={username}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/games/organ-matcher"
            element={
              secondRegistrationComplete ? (
                <LandscapeWrapper>
                  <OrganMatcherGame onBackToGames={() => navigate("/games")} />
                </LandscapeWrapper>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/games/anatomy-quiz"
            element={
              secondRegistrationComplete ? (
                <AnatomyQuiz onBackToGames={() => navigate("/games")} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/games/body-builder"
            element={
              secondRegistrationComplete ? (
                <div>Body System Builder Game (Coming Soon)</div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/ar-heart" element={<Navigate to="/" />} />
          <Route
            path="/scan-explore"
            element={
              secondRegistrationComplete ? (
                <Navigate to="/organ-selection" />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/scan-explore/ar"
            element={
              secondRegistrationComplete ? (
                <ARScannerPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/sliced-heart"
            element={
              secondRegistrationComplete ? (
                <SlicedHeartPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/scan-explore/:organId"
            element={
              secondRegistrationComplete ? (
                <OrganDetailPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
