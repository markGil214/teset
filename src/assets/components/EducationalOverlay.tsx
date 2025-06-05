import React, { useState } from 'react';
import { anatomicalData, Language, getLocalizedContent, getLocalizedArray } from '../data/anatomicalData';

interface EducationalOverlayProps {
  organId: string;
  language: Language;
  isVisible: boolean;
  currentZoom: number;
  onClose: () => void;
}

const EducationalOverlay: React.FC<EducationalOverlayProps> = ({
  organId,
  language,
  isVisible,
  currentZoom,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'parts' | 'facts'>('overview');

  if (!isVisible || currentZoom < 3.0) {
    return null;
  }

  const organData = anatomicalData[organId];
  if (!organData) {
    return null;
  }

  const tabLabels = {
    overview: language === 'en' ? 'Overview' : 'Buod',
    functions: language === 'en' ? 'Functions' : 'Mga Gawain',
    parts: language === 'en' ? 'Parts' : 'Mga Bahagi',
    facts: language === 'en' ? 'Facts' : 'Mga Katotohanan'
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '70vh',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 300,
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 107, 107, 0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#ff6b6b',
          color: 'white',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          {getLocalizedContent(organData.name, language)}
        </h2>
        <button
          onClick={onClose}
          data-ui-element="true"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        {Object.entries(tabLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            data-ui-element="true"
            style={{
              flex: 1,
              padding: '10px 4px',
              border: 'none',
              backgroundColor: activeTab === key ? '#ff6b6b' : 'transparent',
              color: activeTab === key ? 'white' : '#333',
              fontSize: '11px',
              fontWeight: activeTab === key ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: '16px',
          height: '300px',
          overflowY: 'auto',
        }}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <p
              style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#333',
                fontStyle: 'italic',
              }}
            >
              {getLocalizedContent(organData.shortDescription, language)}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#555',
              }}
            >
              {getLocalizedContent(organData.detailedDescription, language)}
            </p>
          </div>
        )}

        {/* Functions Tab */}
        {activeTab === 'functions' && (
          <div>
            <h4
              style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#ff6b6b',
              }}
            >
              {language === 'en' ? 'Main Functions:' : 'Mga Pangunahing Gawain:'}
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#555',
              }}
            >
              {getLocalizedArray(organData.functions, language).map((func, index) => (
                <li key={index} style={{ marginBottom: '6px' }}>
                  {func}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Parts Tab */}
        {activeTab === 'parts' && (
          <div>
            <h4
              style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#ff6b6b',
              }}
            >
              {language === 'en' ? 'Key Parts:' : 'Mga Pangunahing Bahagi:'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {organData.parts.map((part) => (
                <div
                  key={part.id}
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '6px',
                    borderLeft: '3px solid #ff6b6b',
                  }}
                >
                  <h5
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#ff6b6b',
                    }}
                  >
                    {getLocalizedContent(part.name, language)}
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      lineHeight: '1.4',
                      color: '#666',
                    }}
                  >
                    {getLocalizedContent(part.description, language)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facts Tab */}
        {activeTab === 'facts' && (
          <div>
            <h4
              style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#ff6b6b',
              }}
            >
              {language === 'en' ? 'Interesting Facts:' : 'Mga Kawili-wiling Katotohanan:'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getLocalizedArray(organData.facts, language).map((fact, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    💡
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: '1.4',
                      color: '#555',
                    }}
                  >
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '10px',
            color: '#888',
          }}
        >
          {language === 'en' 
            ? 'Zoom in more to explore interactive labels' 
            : 'Mag-zoom pa para makita ang mga interactive label'}
        </p>
      </div>
    </div>
  );
};

export default EducationalOverlay;
