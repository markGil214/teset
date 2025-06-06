import React, { useState, useEffect } from "react";

// Translations
const translations = {
  en: {
    learnMoreTitle: "Learn About Human Anatomy",
    aboutSection: {
      title: "About Our Learning Platform",
      content:
        "Our interactive educational platform helps students learn about human anatomy through engaging games and activities. Perfect for healthcare students and anatomy enthusiasts!",
    },
    featuresSection: {
      title: "Educational Features",
      feature1: "Interactive 3D organ models",
      feature2: "Memory games to reinforce learning",
      feature3: "Detailed quizzes with instant feedback",
      feature4: "Bilingual support (English & Filipino)",
    },
    bodySystemsSection: {
      title: "Explore Body Systems",
      digestive: "Digestive System",
      respiratory: "Respiratory System",
      circulatory: "Circulatory System",
      nervous: "Nervous System",
    },
    startLearning: "Start Learning",
    closeButton: "Close",
  },
  fil: {
    learnMoreTitle: "Alamin ang Tungkol sa Anatomiya ng Tao",
    aboutSection: {
      title: "Tungkol sa Aming Learning Platform",
      content:
        "Ang aming interactive na platform ay tumutulong sa mga mag-aaral na matuto tungkol sa anatomiya ng tao sa pamamagitan ng mga nakaka-engganyong laro at aktibidad. Perpekto para sa mga mag-aaral ng healthcare at anatomy enthusiasts!",
    },
    featuresSection: {
      title: "Mga Educational Features",
      feature1: "Interactive na 3D organ models",
      feature2: "Memory games para palakasin ang pag-aaral",
      feature3: "Detalyadong mga pagsusulit na may instant feedback",
      feature4: "Suportado ang dalawang wika (Ingles & Filipino)",
    },
    startLearning: "Simulan ang Pag-aaral",
    closeButton: "Isara",
  },
};

interface LearnMoreProps {
  onClose: () => void;
  onStartLearning: () => void;
}

const LearnMoreSection: React.FC<LearnMoreProps> = ({
  onClose,
  onStartLearning,
}) => {
  const [language, setLanguage] = useState<"en" | "fil">("en");

  // Get language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("userLanguage");
    if (savedLanguage === "fil") {
      setLanguage("fil");
    }
  }, []);

  const t = translations[language];

  return (
    <div
      className="learn-more-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "clamp(1rem, 5vw, 2rem)",
      }}
    >
      <div
        className="learn-more-container"
        style={{
          backgroundColor: "#241245",
          borderRadius: "clamp(0.5rem, 2vw, 1rem)",
          padding: "clamp(1rem, 3vw, 2rem)",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 5px 20px rgba(0, 0, 0, 0.3)",
          color: "white",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "clamp(0.8rem, 2vw, 1.2rem)",
            right: "clamp(0.8rem, 2vw, 1.2rem)",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
          }}
        >
          ×
        </button>

        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            marginBottom: "clamp(1rem, 3vw, 1.5rem)",
            color: "#f3d849",
            textAlign: "center",
          }}
        >
          {t.learnMoreTitle}
        </h1>

        {/* About Section */}
        <section style={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}>
          <h2
            style={{
              fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
              marginBottom: "clamp(0.5rem, 2vw, 0.8rem)",
              color: "#e78c11",
            }}
          >
            {t.aboutSection.title}
          </h2>
          <p
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              lineHeight: 1.6,
            }}
          >
            {t.aboutSection.content}
          </p>
        </section>

        {/* Features Section */}
        <section style={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}>
          <h2
            style={{
              fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
              marginBottom: "clamp(0.5rem, 2vw, 0.8rem)",
              color: "#e78c11",
            }}
          >
            {t.featuresSection.title}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "clamp(0.8rem, 2vw, 1.2rem)",
            }}
          >
            <FeatureCard icon="🔍" text={t.featuresSection.feature1} />
            <FeatureCard icon="🧠" text={t.featuresSection.feature2} />
            <FeatureCard icon="📝" text={t.featuresSection.feature3} />
            <FeatureCard icon="🌐" text={t.featuresSection.feature4} />
          </div>
        </section>

        {/* Action Button */}
        <div
          style={{
            textAlign: "center",
            marginTop: "clamp(1rem, 4vw, 2rem)",
          }}
        >
          <button
            onClick={onStartLearning}
            style={{
              backgroundColor: "#e78c11",
              color: "white",
              border: "none",
              borderRadius: "clamp(0.3rem, 1vw, 0.5rem)",
              padding:
                "clamp(0.5rem, 1.5vw, 0.8rem) clamp(1.5rem, 3vw, 2.5rem)",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
            }}
          >
            {t.startLearning}
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: "#f3d849",
              border: "1px solid #f3d849",
              borderRadius: "clamp(0.3rem, 1vw, 0.5rem)",
              padding:
                "clamp(0.5rem, 1.5vw, 0.8rem) clamp(1.5rem, 3vw, 2.5rem)",
              fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
              cursor: "pointer",
              marginLeft: "clamp(0.5rem, 2vw, 1rem)",
              transition: "all 0.2s ease",
            }}
          >
            {t.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for feature cards
const FeatureCard: React.FC<{ icon: string; text: string }> = ({
  icon,
  text,
}) => {
  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: "clamp(0.4rem, 1.5vw, 0.8rem)",
        padding: "clamp(0.8rem, 2vw, 1.2rem)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          marginRight: "clamp(0.5rem, 1.5vw, 0.8rem)",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "clamp(0.8rem, 1.8vw, 1rem)" }}>{text}</div>
    </div>
  );
};

// Helper component for system buttons

export default LearnMoreSection;
