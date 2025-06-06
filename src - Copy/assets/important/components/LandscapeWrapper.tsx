import React, { ReactNode, useEffect, useState } from "react";
import "./animation.css";

interface LandscapeWrapperProps {
  children: ReactNode;
}

const LandscapeWrapper: React.FC<LandscapeWrapperProps> = ({ children }) => {
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

  // Add overflow: hidden to body when in landscape mode
  useEffect(() => {
    if (isLandscape) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLandscape]);

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
        <div className="landscape-content">{children}</div>
      )}
    </div>
  );
};

export default LandscapeWrapper;
