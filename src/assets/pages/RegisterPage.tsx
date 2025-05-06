import React, { useState } from "react";
import "../components/animation.css";

interface RegisterPageProps {
  onRegisterComplete: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterComplete }) => {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState("");
  const [language, setLanguage] = useState("");
  const avatarOptions = [
    { value: "avatar1", src: "/images.png", alt: "Avatar 1" },
    { value: "avatar2", src: "/images (1).png", alt: "Avatar 2" }, // Replace with your actual image
    { value: "avatar3", src: "/images (2).png", alt: "Avatar 3" }, // Replace with your actual image
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = `reg_username=${username}; path=/; max-age=86400`;
    document.cookie = `reg_age=${age}; path=/; max-age=86400`;
    document.cookie = `reg_avatar=${avatar}; path=/; max-age=86400`;
    document.cookie = `reg_language=${language}; path=/; max-age=86400`;
    onRegisterComplete(); // Call the prop instead of window.location.href
  };

  return (
    <div className="register-bg">
      <div className="register-title">Welcome!</div>
      <div className="register-card" style={{ position: "relative" }}>
        <div className="register-avatar">
          {avatar && (
            <img
              src={avatarOptions.find((a) => a.value === avatar)?.src}
              alt="Selected Avatar"
              style={{
                width: "5em",
                height: "5em",
                borderRadius: "100%",
                objectFit: "cover",
                border: "none",
                transition: "opacity 0.3s",
                opacity: avatar ? 1 : 0,
              }}
            />
          )}
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          <label>Enter your username:</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Enter your age:</label>
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />

          <label>Select your avatar</label>
          <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
            {avatarOptions.map((option) => (
              <img
                key={option.value}
                src={option.src}
                alt={option.alt}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "100%",
                  border:
                    avatar === option.value
                      ? "2px solid #007bff"
                      : "2px solid transparent",
                  cursor: "pointer",
                  transition: "border 0.2s",
                }}
                onClick={() => setAvatar(option.value)}
              />
            ))}
          </div>

          <label>Select language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          >
            <option value="">Select</option>
            <option value="English">English</option>
            <option value="Filipino">Filipino</option>
          </select>

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>
      </div>
      <div className="register-dots">
        <div className="register-dot active"></div>
        <div className="register-dot"></div>
      </div>
    </div>
  );
};

export default RegisterPage;
