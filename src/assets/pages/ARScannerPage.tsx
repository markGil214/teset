import React, { useEffect } from 'react';

const ARScannerPage: React.FC = () => {
  useEffect(() => {
    // Redirect to the HTML page
    window.location.href = '/src/assets/pages/ARScannerPage.html';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#000',
      color: '#fff'
    }}>
      <p>Loading AR Scanner...</p>
    </div>
  );
};

export default ARScannerPage;
