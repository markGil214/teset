import React, { useState, useCallback } from 'react';
import { Language } from '../data/anatomicalData';

interface AdvancedModesProps {
  organId: string;
  language: Language;
  isVisible: boolean;
  currentZoom: number;
  onCutawayToggle: (enabled: boolean) => void;
  onXrayToggle: (enabled: boolean) => void;
  cutawayEnabled: boolean;
  xrayEnabled: boolean;
}

const AdvancedModes: React.FC<AdvancedModesProps> = ({
  organId,
  language,
  isVisible,
  currentZoom,
  onCutawayToggle,
  onXrayToggle,
  cutawayEnabled,
  xrayEnabled
}) => {
  const [cutawayIntensity, setCutawayIntensity] = useState(0.5);
  const [xrayIntensity, setXrayIntensity] = useState(0.3);

  const handleCutawayToggle = useCallback(() => {
    const newState = !cutawayEnabled;
    onCutawayToggle(newState);
    
    // If enabling cutaway, disable x-ray mode
    if (newState && xrayEnabled) {
      onXrayToggle(false);
    }
  }, [cutawayEnabled, xrayEnabled, onCutawayToggle, onXrayToggle]);

  const handleXrayToggle = useCallback(() => {
    const newState = !xrayEnabled;
    onXrayToggle(newState);
    
    // If enabling x-ray, disable cutaway mode
    if (newState && cutawayEnabled) {
      onCutawayToggle(false);
    }
  }, [xrayEnabled, cutawayEnabled, onXrayToggle, onCutawayToggle]);

  if (!isVisible || currentZoom < 4.0) {
    return null;
  }

  const labels = {
    title: language === 'en' ? 'Advanced Modes' : 'Advanced na Mga Mode',
    cutaway: language === 'en' ? 'Cutaway View' : 'Cross-Section View',
    xray: language === 'en' ? 'X-Ray Mode' : 'X-Ray Mode',
    intensity: language === 'en' ? 'Intensity' : 'Lakas',
    info: language === 'en' 
      ? 'Explore internal structures with advanced viewing modes'
      : 'Tuklasin ang mga panloob na istruktura gamit ang advanced viewing modes'
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        width: '200px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '12px',
        padding: '16px',
        zIndex: 250,
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '8px',
        }}
      >
        🔬 {labels.title}
      </div>

      {/* Info Text */}
      <div
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '10px',
          marginBottom: '16px',
          textAlign: 'center',
          lineHeight: '1.4',
        }}
      >
        {labels.info}
      </div>

      {/* Cutaway Mode */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleCutawayToggle}
          data-ui-element="true"
          style={{
            width: '100%',
            backgroundColor: cutawayEnabled 
              ? 'rgba(255, 152, 0, 0.9)' 
              : 'rgba(96, 125, 139, 0.7)',
            color: 'white',
            border: 'none',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          ✂️ {labels.cutaway}
          {cutawayEnabled && <span style={{ fontSize: '10px' }}>ON</span>}
        </button>

        {cutawayEnabled && (
          <div>
            <label
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '10px',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              {labels.intensity}: {Math.round(cutawayIntensity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={cutawayIntensity}
              onChange={(e) => setCutawayIntensity(parseFloat(e.target.value))}
              data-ui-element="true"
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        )}
      </div>

      {/* X-Ray Mode */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleXrayToggle}
          data-ui-element="true"
          style={{
            width: '100%',
            backgroundColor: xrayEnabled 
              ? 'rgba(33, 150, 243, 0.9)' 
              : 'rgba(96, 125, 139, 0.7)',
            color: 'white',
            border: 'none',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          🩻 {labels.xray}
          {xrayEnabled && <span style={{ fontSize: '10px' }}>ON</span>}
        </button>

        {xrayEnabled && (
          <div>
            <label
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '10px',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              {labels.intensity}: {Math.round(xrayIntensity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.1"
              value={xrayIntensity}
              onChange={(e) => setXrayIntensity(parseFloat(e.target.value))}
              data-ui-element="true"
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        )}
      </div>

      {/* Mode Information */}
      {(cutawayEnabled || xrayEnabled) && (
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '8px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '9px',
            textAlign: 'center',
            lineHeight: '1.3',
          }}
        >
          {cutawayEnabled && (
            <div style={{ marginBottom: '4px' }}>
              {language === 'en' 
                ? 'Cutaway mode reveals internal structures'
                : 'Cutaway mode ay nagpapakita ng mga panloob na istruktura'}
            </div>
          )}
          {xrayEnabled && (
            <div>
              {language === 'en' 
                ? 'X-ray mode shows translucent view'
                : 'X-ray mode ay nagpapakita ng translucent view'}
            </div>
          )}
        </div>
      )}

      {/* Availability Notice for specific organs */}
      {organId !== 'heart' && (cutawayEnabled || xrayEnabled) && (
        <div
          style={{
            marginTop: '8px',
            padding: '6px',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            borderRadius: '4px',
            color: '#ffc107',
            fontSize: '9px',
            textAlign: 'center',
          }}
        >
          {language === 'en' 
            ? 'Advanced modes optimized for heart model'
            : 'Mga advanced mode ay na-optimize para sa heart model'}
        </div>
      )}
    </div>
  );
};

export default AdvancedModes;
