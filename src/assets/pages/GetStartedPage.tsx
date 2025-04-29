// src/GetStartedPage.tsx
import Animation from "../components/animation";

const GetStartedPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="get-started-screen">
      <Animation />
      <h1 className="heading-title">OrganQuest</h1>
      <p className="sub-heading">The Human Anatomy Explorer</p>
      <button className="btn" onClick={onStart}>
        Get Started
      </button>
    </div>
  );
};

export default GetStartedPage;
