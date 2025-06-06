// src/components/Loading.js
import "./Loading.css"; // Import CSS for styling

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}
