import React, { useState } from 'react';
import { Language } from '../data/anatomicalData';

interface HelpGuideProps {
  language: Language;
  isVisible: boolean;
  onClose: () => void;
}

const HelpGuide: React.FC<HelpGuideProps> = ({
  language,
  isVisible,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'getting-started' | 'controls' | 'features' | 'troubleshooting'>('getting-started');

  if (!isVisible) {
    return null;
  }

  const content = {
    en: {
      title: "AR Educational Scanner - Help Guide",
      sections: {
        'getting-started': "Getting Started",
        'controls': "Controls",
        'features': "Features",
        'troubleshooting': "Troubleshooting"
      },
      gettingStarted: {
        title: "Getting Started",
        steps: [
          "Point your camera at the Hiro marker pattern",
          "Wait for the 3D organ model to appear",
          "Use pinch gestures to zoom in and out",
          "Explore different zoom levels to unlock features"
        ]
      },
      controls: {
        title: "Control Guide",
        items: [
          {
            icon: "👆",
            title: "Pinch to Zoom",
            description: "Use two fingers to zoom in and out of the model"
          },
          {
            icon: "🔄",
            title: "Automatic Rotation",
            description: "The model rotates automatically for better viewing"
          },
          {
            icon: "🏷️",
            title: "Toggle Labels",
            description: "Show/hide anatomical labels (available at 2x zoom)"
          },
          {
            icon: "🌐",
            title: "Language Switch",
            description: "Switch between English and Filipino"
          }
        ]
      },
      features: {
        title: "Available Features",
        zoomLevels: [
          {
            level: "1x - 2x",
            title: "Basic View",
            features: ["3D Model Display", "Automatic Rotation", "Basic Controls"]
          },
          {
            level: "2x - 3x",
            title: "Educational Mode",
            features: ["Interactive Labels", "Audio Narration", "Part Information"]
          },
          {
            level: "3x - 4x",
            title: "Detailed Study",
            features: ["Educational Overlay", "Comprehensive Information", "Facts Panel"]
          },
          {
            level: "4x+",
            title: "Advanced Analysis",
            features: ["Cutaway View", "X-ray Mode", "Advanced Interaction"]
          }
        ]
      },
      troubleshooting: {
        title: "Common Issues",
        issues: [
          {
            problem: "Model not appearing",
            solutions: [
              "Ensure good lighting conditions",
              "Keep the Hiro marker flat and visible",
              "Move closer to or further from the marker",
              "Check camera permissions"
            ]
          },
          {
            problem: "Poor performance",
            solutions: [
              "Close other applications",
              "Use a newer device if possible",
              "Reduce zoom level",
              "Check the performance monitor"
            ]
          },
          {
            problem: "Labels not showing",
            solutions: [
              "Zoom in to at least 2x magnification",
              "Tap the labels toggle button",
              "Ensure the model is properly detected"
            ]
          }
        ]
      }
    },
    fil: {
      title: "AR Educational Scanner - Gabay sa Paggamit",
      sections: {
        'getting-started': "Pagsisimula",
        'controls': "Mga Kontrol",
        'features': "Mga Tampok",
        'troubleshooting': "Paglutas ng Problema"
      },
      gettingStarted: {
        title: "Pagsisimula",
        steps: [
          "Itutok ang inyong camera sa Hiro marker pattern",
          "Maghintay para lumabas ang 3D organ model",
          "Gamitin ang pinch gestures para mag-zoom in at out",
          "Tuklasin ang iba't ibang zoom levels para ma-unlock ang mga features"
        ]
      },
      controls: {
        title: "Gabay sa Kontrol",
        items: [
          {
            icon: "👆",
            title: "Pinch para mag-Zoom",
            description: "Gamitin ang dalawang daliri para mag-zoom in at out sa model"
          },
          {
            icon: "🔄",
            title: "Automatic na Pag-ikot",
            description: "Ang model ay umiikot nang kusang-loob para sa mas magandang pagkakatingin"
          },
          {
            icon: "🏷️",
            title: "Toggle ng mga Label",
            description: "Ipakita/itago ang mga anatomical label (makikita sa 2x zoom)"
          },
          {
            icon: "🌐",
            title: "Paglipat ng Wika",
            description: "Lumipat sa pagitan ng English at Filipino"
          }
        ]
      },
      features: {
        title: "Mga Available na Tampok",
        zoomLevels: [
          {
            level: "1x - 2x",
            title: "Pangunahing Tingin",
            features: ["3D Model Display", "Automatic na Pag-ikot", "Pangunahing mga Kontrol"]
          },
          {
            level: "2x - 3x",
            title: "Educational Mode",
            features: ["Interactive na mga Label", "Audio Narration", "Impormasyon ng mga Bahagi"]
          },
          {
            level: "3x - 4x",
            title: "Detalyadong Pag-aaral",
            features: ["Educational Overlay", "Komprehensibong Impormasyon", "Facts Panel"]
          },
          {
            level: "4x+",
            title: "Advanced na Pagsusuri",
            features: ["Cutaway View", "X-ray Mode", "Advanced na Pakikipag-ugnayan"]
          }
        ]
      },
      troubleshooting: {
        title: "Mga Karaniwang Problema",
        issues: [
          {
            problem: "Hindi lumalabas ang model",
            solutions: [
              "Siguraduhin ang magandang kondisyon ng ilaw",
              "Panatilihin ang Hiro marker na patag at nakikita",
              "Lumapit o lumayo sa marker",
              "Suriin ang mga pahintulot sa camera"
            ]
          },
          {
            problem: "Mahinang performance",
            solutions: [
              "Isara ang ibang mga application",
              "Gumamit ng mas bagong device kung maaari",
              "Bawasan ang zoom level",
              "Suriin ang performance monitor"
            ]
          },
          {
            problem: "Hindi nagpapakita ang mga label",
            solutions: [
              "Mag-zoom in ng hindi bababa sa 2x magnification",
              "I-tap ang labels toggle button",
              "Siguraduhin na properly detected ang model"
            ]
          }
        ]
      }
    }
  };

  const currentContent = content[language];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#ff6b6b',
            color: 'white',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            {currentContent.title}
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
            }}
          >
            ×
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          {Object.entries(currentContent.sections).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              data-ui-element="true"
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                backgroundColor: activeSection === key ? '#ff6b6b' : 'transparent',
                color: activeSection === key ? 'white' : '#333',
                fontSize: '12px',
                fontWeight: activeSection === key ? 'bold' : 'normal',
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
            padding: '20px',
            height: '400px',
            overflowY: 'auto',
          }}
        >
          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <div>
              <h3 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
                {currentContent.gettingStarted.title}
              </h3>
              <ol style={{ paddingLeft: '20px' }}>
                {currentContent.gettingStarted.steps.map((step, index) => (
                  <li key={index} style={{ marginBottom: '12px', lineHeight: '1.5' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Controls */}
          {activeSection === 'controls' && (
            <div>
              <h3 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
                {currentContent.controls.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentContent.controls.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>
                        {item.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {activeSection === 'features' && (
            <div>
              <h3 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
                {currentContent.features.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentContent.features.zoomLevels.map((level, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '16px', 
                      border: '2px solid #f0f0f0', 
                      borderRadius: '8px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#ff6b6b' }}>
                        {level.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
                        {level.level}
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      {level.features.map((feature, featureIndex) => (
                        <li key={featureIndex} style={{ marginBottom: '4px' }}>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          {activeSection === 'troubleshooting' && (
            <div>
              <h3 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
                {currentContent.troubleshooting.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {currentContent.troubleshooting.issues.map((issue, index) => (
                  <div key={index}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#d32f2f' }}>
                      ❌ {issue.problem}
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      {issue.solutions.map((solution, solutionIndex) => (
                        <li key={solutionIndex} style={{ marginBottom: '4px', color: '#666' }}>
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpGuide;
