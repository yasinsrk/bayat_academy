import React from 'react';
import { motion } from 'framer-motion';

function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={styles.container}
    >
      {/* Animated Circle Background */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
        style={styles.circle}
      />

      {/* Rotating Ring */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={styles.ring}
      />

      {/* Second Ring */}
      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        style={styles.ring2}
      />

      {/* Logo Text - B */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={styles.logoText}
      >
        <span style={styles.b}>B</span>
        <motion.span
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={styles.dot}
        />
      </motion.div>

      {/* Sparkles */}
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1,
          ease: "easeInOut",
        }}
        style={{...styles.sparkle, top: '-10px', right: '-10px'}}
      />
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 1.5,
          ease: "easeInOut",
        }}
        style={{...styles.sparkle, bottom: '-10px', left: '-10px'}}
      />
      <motion.div
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 2,
          ease: "easeInOut",
        }}
        style={{...styles.sparkle, top: '-5px', left: '-5px'}}
      />

      {/* Shine Effect */}
      <motion.div
        animate={{
          x: [-100, 100],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 1,
          ease: "easeInOut",
        }}
        style={styles.shine}
      />
    </motion.div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  circle: {
    position: 'absolute',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(245, 215, 110, 0.02))',
    border: '1px solid rgba(212, 175, 55, 0.05)',
  },
  ring: {
    position: 'absolute',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '1.5px solid rgba(212, 175, 55, 0.08)',
    borderTop: '1.5px solid #D4AF37',
  },
  ring2: {
    position: 'absolute',
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: '1px solid rgba(212, 175, 55, 0.06)',
    borderBottom: '1px solid #D4AF37',
  },
  logoText: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  b: {
    fontSize: '48px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #D4AF37, #F5D76E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 4px 30px rgba(212, 175, 55, 0.1)',
  },
  dot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#D4AF37',
    marginTop: '-20px',
  },
  sparkle: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#D4AF37',
    boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
  },
  shine: {
    position: 'absolute',
    width: '40px',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
    transform: 'skewX(-20deg)',
    borderRadius: '50%',
  },
};

export default Logo;