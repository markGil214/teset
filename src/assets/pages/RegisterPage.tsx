import React, { useState } from "react";
import "../components/animation.css";

interface RegisterPageProps {
  onRegisterComplete: () => void;
}

const avatarOptions = [
  { value: "avatar1", src: "/avatar1.webp", alt: "Avatar 1" },
  { value: "avatar2", src: "/avatar2.webp", alt: "Avatar 2" },
  { value: "avatar3", src: "/avatar3.webp", alt: "Avatar 3" },
  { value: "avatar4", src: "/avatar4.webp", alt: "Avatar 4" },
  { value: "avatar5", src: "/avatar5.webp", alt: "Avatar 5" },
  { value: "avatar6", src: "/avatar6.webp", alt: "Avatar 6" },
];

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterComplete }) => {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState("");
  const [language, setLanguage] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = `reg_username=${username}; path=/; max-age=86400`;
    document.cookie = `reg_age=${age}; path=/; max-age=86400`;
    document.cookie = `reg_avatar=${avatar}; path=/; max-age=86400`;
    document.cookie = `reg_language=${language}; path=/; max-age=86400`;
    onRegisterComplete();
  };

  return (
    <div className="register-bg">
      <div className="register-title">Welcome!</div>
      <div className="register-card" style={{ position: "relative" }}>
        <div
          className="register-avatar"
          style={{ minHeight: "5em", minWidth: "5em", position: "relative" }}
        >
          {avatar && (
            <>
              {!imgLoaded && (
                <div
                  style={{
                    width: "5em",
                    height: "5em",
                    borderRadius: "100%",
                    background: "#eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                >
                  <span style={{ color: "#bbb" }}>Loading...</span>
                </div>
              )}
              <img
                src={avatarOptions.find((a) => a.value === avatar)?.src}
                alt="Selected Avatar"
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                style={{
                  width: "5em",
                  height: "5em",
                  borderRadius: "100%",
                  objectFit: "cover",
                  border: "none",
                  transition: "opacity 0.3s",
                  opacity: imgLoaded ? 1 : 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 2,
                }}
                onLoad={() => setImgLoaded(true)}
              />
            </>
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
                width={50}
                height={50}
                loading="lazy"
                decoding="async"
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
                  objectFit: "cover",
                  boxShadow:
                    avatar === option.value ? "0 0 8px #007bff44" : "none",
                }}
                onClick={() => {
                  setAvatar(option.value);
                  setImgLoaded(false);
                }}
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
