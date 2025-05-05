import React, { ReactNode, useEffect, useState } from "react";
import "./animation.css"; // Import your CSS file for styling

interface LandscapeWrapperProps {
  children: ReactNode;
  onExit?: () => void;
}

const LandscapeWrapper: React.FC<LandscapeWrapperProps> = ({
  children,
  onExit,
}) => {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return (
    <div className="landscape-game-container">
      {!isLandscape ? (
        <div className="rotate-device-message">
          <div className="rotate-icon">⟳</div>
          <p>
            Please rotate your device to landscape mode for the best experience
          </p>
        </div>
      ) : (
        <>
          <div className="landscape-content">{children}</div>
        </>
      )}
    </div>
  );
};

export default LandscapeWrapper;
