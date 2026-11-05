import React from 'react';
import { motion } from 'framer-motion';

function Logo3D({ logoUrl, size = 160 }) {
  const defaultLogo = '/logo.png';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateX: -30, rotateY: -30 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        transition: {
          duration: 1.2,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 20,
        }
      }}
      whileHover={{
        rotateX: 8,
        rotateY: 20,
        scale: 1.08,
        transition: { duration: 0.4 }
      }}
      style={{
        ...styles.container,
        width: size,
        height: size,
        perspective: 1200,
      }}
    >
      {/* Glow Ring - با #1A1932 */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.08, 0.25, 0.08],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          ...styles.glowRing,
          width: size + 60,
          height: size + 60,
        }}
      />

      {/* حلقه اصلی - #1A1932 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          ...styles.ring,
          width: size + 40,
          height: size + 40,
          borderWidth: '2.5px',
          borderColor: 'rgba(26,25,50,0.06)',
          borderTopColor: '#1A1932',
          boxShadow: '0 0 30px rgba(26,25,50,0.03)',
        }}
      />

      {/* حلقه دوم - معکوس */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          ...styles.ring,
          width: size + 25,
          height: size + 25,
          borderWidth: '2px',
          borderColor: 'rgba(26,25,50,0.04)',
          borderBottomColor: '#1A1932',
          boxShadow: '0 0 30px rgba(26,25,50,0.02)',
        }}
      />

      {/* حلقه سوم - با نقاط */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{
          ...styles.ring,
          width: size + 10,
          height: size + 10,
          borderWidth: '1.5px',
          borderColor: 'rgba(255,107,138,0.04)',
          borderRightColor: '#FF6B8A',
          borderStyle: 'dashed',
        }}
      />

      {/* لوگو */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          ...styles.logoWrapper,
          width: size,
          height: size,
        }}
      >
        <img
          src={logoUrl || defaultLogo}
          alt="بیات آکادمی"
          style={styles.logoImage}
        />

        {/* Shine Effect */}
        <motion.div
          animate={{
            x: [-size, size],
            opacity: [0, 0.10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut",
          }}
          style={{
            ...styles.shine,
            width: size * 0.3,
            height: size,
          }}
        />
      </motion.div>

      {/* ذرات درخشان دور لوگو - با #1A1932 */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = size * 0.6;
        const colors = ['#1A1932', '#2A2950', '#3A3970', '#4A4990', '#5A5AB0', '#1A1932'];

        return (
          <motion.div
            key={i}
            animate={{
              x: [
                0,
                Math.cos(angle + Math.PI / 6) * radius,
                Math.cos(angle) * radius * 0.3,
                Math.cos(angle + Math.PI / 6) * radius,
                0,
              ],
              y: [
                0,
                Math.sin(angle + Math.PI / 6) * radius,
                Math.sin(angle) * radius * 0.3,
                Math.sin(angle + Math.PI / 6) * radius,
                0,
              ],
              scale: [0, 1.2, 0.8, 1.2, 0],
              opacity: [0, 0.5, 0.25, 0.5, 0],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
            style={{
              ...styles.particle,
              width: 6 + (i % 3) * 2,
              height: 6 + (i % 3) * 2,
              background: colors[i % colors.length],
              boxShadow: `0 0 20px ${colors[i % colors.length]}`,
            }}
          />
        );
      })}

      {/* Sparkle های کوچک - #1A1932 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.7, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          style={{
            ...styles.sparkle,
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            top: `${30 + Math.random() * 40}%`,
            left: `${30 + Math.random() * 40}%`,
            background: ['#1A1932', '#2A2950', '#3A3970', '#1A1932', '#2A2950', '#1A1932'][i],
          }}
        />
      ))}
    </motion.div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    transformStyle: 'preserve-3d',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,25,50,0.05) 0%, transparent 70%)',
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
    background: 'rgba(255,255,255,0.04)',
    boxShadow: '0 8px 60px rgba(26,25,50,0.05)',
    border: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backdropFilter: 'blur(10px)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '12%',
  },
  shine: {
    position: 'absolute',
    top: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
    transform: 'skewX(-20deg)',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    boxShadow: '0 0 15px currentColor',
  },
};

export default Logo3D;