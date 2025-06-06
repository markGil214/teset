import React, { useEffect, useState } from "react";
import "../components/animation.css";

// Helper to get cookie value
function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

// Translations
const translations = {
  en: {
    welcome: "Welcome",
    joinMessage:
      "Join OrganQuest on an exciting journey through the human body!",
    completeRegistration: "Complete Registration",
    languagePreference: "Language preference",
    filipino: "Filipino",
    english: "English",
  },
  fil: {
    welcome: "Maligayang pagdating",
    joinMessage:
      "Sumali sa OrganQuest sa isang kapana-panabik na paglalakbay sa katawan ng tao!",
    completeRegistration: "Kumpletuhin ang Pagrehistro",
    languagePreference: "Kagustuhang wika",
    filipino: "Filipino",
    english: "Ingles",
  },
};

interface SecondRegistrationPageProps {
  onRegisterCompleted: () => void;
}

const SecondRegistrationPage: React.FC<SecondRegistrationPageProps> = ({
  onRegisterCompleted,
}) => {
  const [username, setUsername] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [language, setLanguage] = useState<"en" | "fil">("en");

  useEffect(() => {
    // Get username from cookies
    setUsername(getCookie("reg_username"));

    // Get language preference from cookies
    const savedLanguage = getCookie("reg_language");
    if (savedLanguage === "Filipino") {
      setLanguage("fil");
    }
  }, []);

  useEffect(() => {
    // Add animation effect when component mounts
    setTimeout(() => {
      setImageLoaded(true);
    }, 100); // Small delay for better visual effect
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // You can store the final language preference here if needed
    localStorage.setItem("userLanguage", language);

    onRegisterCompleted();
  };

  // Get translation object based on language
  const t = translations[language];

  return (
    <div className="register-bg" style={{ minHeight: "100vh" }}>
      <div className="register-title" style={{ marginTop: "2em" }}>
        {t.welcome}, {username}!
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", margin: "1.5em 0" }}
      >
        <img
          src="/pngtree-educational-human-body-anatomy-illustration-for-kids-png-image_15908244.png"
          alt="Child Avatar"
          className={`image-avatar ${
            imageLoaded ? "image-loaded" : "image-loading"
          }`}
          style={{
            width: 250,
            height: "auto",
            zIndex: 20,
            transition: "all 0.8s ease-in-out",
          }}
        />
      </div>
      <div
        style={{
          color: "#fff",
          textAlign: "center",
          margin: "1.5em 1em",
          fontSize: "1.1em",
          zIndex: 20,
        }}
      >
        {t.joinMessage}
      </div>
      <form onSubmit={handleSubmit}>
        <button className="register-btn" type="submit">
          {t.completeRegistration}
        </button>
      </form>
      <div className="register-dots" style={{ marginTop: 24 }}>
        <div className="register-dot"></div>
        <div className="register-dot active"></div>
      </div>
    </div>
  );
};

export default SecondRegistrationPage;
