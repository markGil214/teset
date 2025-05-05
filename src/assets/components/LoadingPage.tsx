import { useEffect, useState } from "react";

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 3000 / 100); // divide 8000ms into 100 steps

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <h1 className="heading-title">OrganQuest</h1>
      <p className="sub-heading">The Human Anatomy Explorer</p>
      <div className="loader">{progress}%</div> {/* Show the progress number */}
    </div>
  );
};

export default LoadingPage;
