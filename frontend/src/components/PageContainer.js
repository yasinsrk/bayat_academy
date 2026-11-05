// src/components/PageContainer.js
import React from 'react';

function PageContainer({ children, className = '' }) {
  return (
    <div style={styles.container}>
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      {children}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 60px',
    background: '#f8f6f2',
    position: 'relative',
    overflow: 'hidden',
  },
};

export default PageContainer;