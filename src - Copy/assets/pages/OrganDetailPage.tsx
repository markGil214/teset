import React, { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import { ModelViewer } from "../components/3DModelViewer";
import "./OrganDetailPage.css";

const OrganDetailPage: React.FC = () => {
  const { organId } = useParams<{ organId: string }>();
  const organ = organs.find((o) => o.id === organId);
  const navigate = useNavigate();

  if (!organ) {
    return <div>Organ not found.</div>;
  }

  return (
    <div className="organ-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>{organ.name}</h2>
      <Suspense fallback={<div>Loading 3D Model...</div>}>
        <ModelViewer modelPath={organ.modelPath} />
      </Suspense>
      <button
        className="ar-btn"
        style={{ marginTop: 16 }}
        onClick={() => navigate(`/scan-explore/${organ.id}/ar`)}
      >
        View in AR
      </button>
      <div className="organ-description">{organ.description}</div>
    </div>
  );
};

export default OrganDetailPage;
