import React from 'react';
import { motion } from 'framer-motion';

function AnimatedLogo({ logoUrl, size = 120 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={styles.container}
    >
      {/* Glow Effect - با #1A1932 */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.4, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          ...styles.glow,
          width: size + 40,
          height: size + 40,
        }}
      />

      {/* Rotating Ring - با #1A1932 */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          ...styles.ring,
          width: size + 20,
          height: size + 20,
          borderColor: 'rgba(26,25,50,0.08)',
          borderTopColor: '#1A1932',
        }}
      />

      {/* Second Ring - Counter Rotate */}
      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          ...styles.ring,
          width: size + 10,
          height: size + 10,
          borderColor: 'rgba(26,25,50,0.05)',
          borderBottomColor: '#1A1932',
        }}
      />

      {/* Logo Image */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          ...styles.logoWrapper,
          width: size,
          height: size,
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="بیات آکادمی"
            style={styles.logoImage}
          />
        ) : (
          <div style={styles.logoPlaceholder}>
            <span style={styles.logoPlaceholderText}>بیات</span>
            <span style={styles.logoPlaceholderSub}>آکادمی</span>
          </div>
        )}
      </motion.div>

      {/* Sparkles - با #1A1932 */}
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 0.5,
          ease: "easeInOut",
        }}
        style={{ ...styles.sparkle, top: -8, right: -8 }}
      />
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 1.2,
          ease: "easeInOut",
        }}
        style={{ ...styles.sparkle, bottom: -8, left: -8 }}
      />
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          delay: 2,
          ease: "easeInOut",
        }}
        style={{ ...styles.sparkle, top: '30%', right: -12 }}
      />
    </motion.div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  glow: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,25,50,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ring: {
    position: 'absolute',
    borderRadius: '50%',
    border: '2px solid transparent',
    pointerEvents: 'none',
  },
  logoWrapper: {
    position: 'relative',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#FFFFFF',
    boxShadow: '0 8px 40px rgba(26,25,50,0.08)',
    border: '2px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '8%',
  },
  logoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1A1932, #2A2950)',
    width: '100%',
    height: '100%',
  },
  logoPlaceholderText: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-1px',
  },
  logoPlaceholderSub: {
    fontSize: '10px',
    fontWeight: '300',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  sparkle: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#1A1932',
    boxShadow: '0 0 20px rgba(26,25,50,0.2)',
    zIndex: 3,
  },
};

export default AnimatedLogo;