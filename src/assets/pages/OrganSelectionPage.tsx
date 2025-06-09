import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import "../components/animation.css";

interface OrganSelectionPageProps {
  onBackToHome?: () => void;
}

const OrganSelectionPage: React.FC<OrganSelectionPageProps> = ({
  onBackToHome,
}) => {
  const navigate = useNavigate();
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "fil">("en");

  useEffect(() => {
    // Get language preference from localStorage
    const savedLanguage = localStorage.getItem("preferredLanguage") as
      | "en"
      | "fil";
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const translations = {
    en: {
      title: "Select an Organ",
      subtitle:
        "Choose the organ you want to explore in augmented reality. Point your camera at the Hiro marker to begin your interactive medical journey.",
      backToHome: "← Back to Home",
      startARScan: "Start AR Scan",
    },
    fil: {
      title: "Pumili ng Organ",
      subtitle:
        "Piliin ang organ na gusto mong tuklasin sa augmented reality. Itutok ang inyong camera sa Hiro marker upang magsimula sa interactive medical journey.",
      backToHome: "← Bumalik sa Home",
      startARScan: "Simulan ang AR Scan",
    },
  };

  const t = translations[language];

  const handleOrganSelect = (organId: string) => {
    const organ = organs.find((o) => o.id === organId);
    if (organ) {
      // Store organ data in localStorage for the AR Scanner to access
      localStorage.setItem("selectedOrgan", JSON.stringify(organ));
      // Navigate directly to AR Scanner
      navigate("/scan-explore/ar");
    }
  };

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate("/home");
    }
  };
  return (
    <div className="dashboard-container">
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 10,
        }}
      >
        {" "}
        {/* Back Button */}
        <button
          onClick={handleBackToHome}
          className="dashboard-btn"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            padding: "12px 24px",
            borderRadius: "50px",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            marginBottom: "2rem",
            backdropFilter: "blur(10px)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            alignSelf: "flex-start",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.transform = "translateX(-5px)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
        >
          {t.backToHome}
        </button>{" "}
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
              fontWeight: "700",
              marginBottom: "1rem",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              color: "#f3d849", // Matching homepage welcome text color
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              opacity: 0.9,
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.6,
              color: "white",
            }}
          >
            {t.subtitle}
          </p>
        </div>
        {/* Organ Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {organs.map((organ) => (
            <div
              key={organ.id}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                padding: "2rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden",
                transform:
                  selectedOrgan === organ.id
                    ? "translateY(-10px) scale(1.02)"
                    : "translateY(0)",
                borderColor:
                  selectedOrgan === organ.id
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(255, 255, 255, 0.1)",
                boxShadow:
                  selectedOrgan === organ.id
                    ? "0 20px 40px rgba(0,0,0,0.2)"
                    : "0 10px 20px rgba(0,0,0,0.1)",
              }}
              onClick={() => setSelectedOrgan(organ.id)}
              onMouseEnter={(e) => {
                if (selectedOrgan !== organ.id) {
                  e.currentTarget.style.transform =
                    "translateY(-15px) scale(1.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px rgba(0,0,0,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOrgan !== organ.id) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.1)";
                }
              }}
            >
              {/* Organ Image */}
              <img
                src={organ.image}
                alt={organ.name}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                  marginBottom: "1.5rem",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                  transition: "transform 0.4s ease",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Organ Name */}
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  color: "#fff",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {organ.name}
              </h3>

              {/* Organ Description */}
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  opacity: 0.9,
                  marginBottom: "1.5rem",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {organ.description}
              </p>

              {/* Selection Indicator */}
              {selectedOrgan === organ.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    background: "linear-gradient(135deg, #4CAF50, #45a049)",
                    color: "white",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>{" "}
        {/* Start AR Scan Button */}
        {selectedOrgan && (
          <div
            style={{
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={() => handleOrganSelect(selectedOrgan)}
              className="dashboard-btn"
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                color: "white",
                border: "none",
                padding: "18px 36px",
                borderRadius: "50px",
                fontSize: "1.2rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: "1px",
                boxShadow: "0 8px 20px rgba(255, 107, 107, 0.3)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 12px 25px rgba(255, 107, 107, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(255, 107, 107, 0.3)";
              }}
            >
              {t.startARScan}
            </button>
          </div>
        )}{" "}
      </div>
    </div>
  );
};

export default OrganSelectionPage;
