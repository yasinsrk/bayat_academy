// src/components/GlassCard.js
import React from 'react';
import { motion } from 'framer-motion';

function GlassCard({ children, className = '', style = {}, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        ...styles.card,
        ...style,
      }}
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: '32px',
    border: '0.5px solid rgba(255,255,255,0.4)',
    boxShadow: '0 8px 60px rgba(0,0,0,0.02), inset 0 0.5px 0 rgba(255,255,255,0.8)',
    padding: '40px 36px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
};

export default GlassCard;