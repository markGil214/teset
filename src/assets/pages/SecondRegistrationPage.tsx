import React, { useEffect, useState } from "react";
import "../components/animation.css";

// Helper to get cookie value
function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

interface SecondRegistrationPageProps {
  onRegisterCompleted: () => void;
}

const SecondRegistrationPage: React.FC<SecondRegistrationPageProps> = ({
  onRegisterCompleted,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterCompleted();
  };

  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(getCookie("reg_username"));
  }, []);

  return (
    <div className="register-bg" style={{ minHeight: "100vh" }}>
      <div className="register-title" style={{ marginTop: "2em" }}>
        Welcome, {username}!
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", margin: "1.5em 0" }}
      >
        <img
          src="/public/pngtree-educational-human-body-anatomy-illustration-for-kids-png-image_15908244.png"
          alt="Child Avatar"
          style={{ width: 250, height: "auto", zIndex: 20 }}
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
        Join OrganQuest on an exciting journey through the human body!
      </div>
      <form onSubmit={handleSubmit}>
        {/* Your form fields */}
        <button className="register-btn" type="submit">
          Complete Registration
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
