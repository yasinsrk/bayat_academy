import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVideoPlay } from '../features/packages/packageSlice';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPlay, FaPause, FaExpand, FaCompress, FaLock, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { videoPlay, loading, error } = useSelector((state) => state.packages);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }
    dispatch(getVideoPlay(videoId));
  }, [dispatch, videoId, isAuthenticated, navigate]);

  // Initialize Spot Player when video data is available
  useEffect(() => {
    if (videoPlay && videoPlay.video_id) {
      initializeSpotPlayer();
    }
  }, [videoPlay]);

  const initializeSpotPlayer = () => {
    // Spot Player SDK - Replace with your actual Spot Player implementation
    // This is a mock implementation - you'll need to use the actual Spot Player SDK

    // Check if Spot Player script is loaded
    if (typeof window.SpotPlayer !== 'undefined') {
      const container = document.getElementById('spot-player-container');
      if (container) {
        const player = new window.SpotPlayer({
          container: container,
          videoId: videoPlay.video_id,
          autoplay: false,
          controls: true,
          responsive: true,
          // For ArvanCloud videos
          source: {
            hls: videoPlay.stream_url || `https://cdn.spotplayer.com/videos/${videoPlay.video_id}.m3u8`,
          },
          onReady: () => {
            setPlayerReady(true);
            console.log('Spot Player ready');
          },
          onPlay: () => setIsPlaying(true),
          onPause: () => setIsPlaying(false),
          onTimeUpdate: (currentTime, totalTime) => {
            setProgress((currentTime / totalTime) * 100);
            setDuration(totalTime);
          },
          onEnded: () => {
            setIsPlaying(false);
            setProgress(0);
          },
          onError: (error) => {
            console.error('Spot Player error:', error);
            toast.error('خطا در پخش ویدیو');
          }
        });
        playerRef.current = player;
      }
    } else {
      // If Spot Player not loaded, load it
      loadSpotPlayerScript();
    }
  };

  const loadSpotPlayerScript = () => {
    // Load Spot Player SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.spotplayer.com/spot-player.min.js'; // Replace with actual URL
    script.async = true;
    script.onload = () => {
      setTimeout(initializeSpotPlayer, 500);
    };
    script.onerror = () => {
      console.error('Failed to load Spot Player');
      toast.error('خطا در بارگذاری پخش‌کننده');
    };
    document.head.appendChild(script);
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('spot-player-container');
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (playerRef.current) {
      playerRef.current.seek(seekTime);
      setProgress(e.target.value);
    }
  };

  const handleDownload = () => {
    toast.info('دانلود ویدیو برای کاربران غیرفعال است');
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>در حال بارگذاری ویدیو...</p>
      </div>
    );
  }

  if (error || !videoPlay) {
    return (
      <div style={styles.error}>
        <h2>⚠️ ویدیو یافت نشد</h2>
        <p>{typeof error === 'string' ? error : 'شما به این ویدیو دسترسی ندارید'}</p>
        <Link to="/" style={styles.backBtn}>← بازگشت به صفحه اصلی</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Link to={`/package/1`} style={styles.backLink}>
        <FaArrowLeft /> بازگشت به دوره
      </Link>

      <div style={styles.playerWrapper}>
        <div style={styles.playerContainer}>
          <div style={styles.player}>
            {/* Spot Player Container */}
            <div id="spot-player-container" style={styles.playerElement}>
              {!playerReady && (
                <div style={styles.playerPlaceholder}>
                  <div style={styles.lockIconLarge}>
                    <FaPlay />
                  </div>
                  <p style={styles.placeholderText}>در حال بارگذاری پخش‌کننده...</p>
                  <div style={styles.smallSpinner}></div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Controls */}
          <div style={styles.controls}>
            <button onClick={togglePlay} style={styles.controlBtn} disabled={!playerReady}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <div style={styles.progressBar}>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                style={styles.progressInput}
                disabled={!playerReady}
              />
              <span style={styles.timeDisplay}>
                {Math.floor((progress / 100) * duration)}s / {Math.floor(duration)}s
              </span>
            </div>

            <button onClick={toggleFullscreen} style={styles.controlBtn} disabled={!playerReady}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>

            <button onClick={handleDownload} style={styles.controlBtn} title="دانلود غیرفعال">
              <FaDownload />
            </button>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div style={styles.info}>
        <h1 style={styles.title}>{videoPlay.video_title || 'ویدیو'}</h1>
        <p style={styles.description}>
          مدت زمان: {Math.floor(videoPlay.duration || 0)} ثانیه
          {videoPlay.video_id && <span style={styles.videoId}> | ID: {videoPlay.video_id}</span>}
        </p>
        <div style={styles.qualityBadge}>
          <span>🎥 کیفیت: خودکار (Adaptive)</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '100px 24px 60px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(10,10,10,0.4)',
    textDecoration: 'none',
    marginBottom: '24px',
    transition: 'color 0.3s ease',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    color: 'rgba(10,10,10,0.5)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(212, 175, 55, 0.1)',
    borderTop: '3px solid #D4AF37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  smallSpinner: {
    width: '24px',
    height: '24px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTop: '2px solid #D4AF37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    color: '#FF6B6B',
  },
  backBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'rgba(0,0,0,0.04)',
    color: '#0A0A0A',
    textDecoration: 'none',
    borderRadius: '12px',
    marginTop: '16px',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  playerWrapper: {
    marginBottom: '32px',
  },
  playerContainer: {
    background: '#0A0A0A',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.05)',
  },
  player: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // 16:9 aspect ratio
    background: '#0A0A0A',
  },
  playerElement: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  playerPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.3)',
    gap: '12px',
    background: '#0A0A0A',
  },
  lockIconLarge: {
    fontSize: '48px',
    color: 'rgba(255,255,255,0.1)',
  },
  placeholderText: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 20px',
    background: 'rgba(10,10,10,0.9)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255,255,255,0.03)',
  },
  controlBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: 'white',
      background: 'rgba(255,255,255,0.05)',
    },
    '&:disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
  },
  progressBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressInput: {
    flex: 1,
    height: '3px',
    WebkitAppearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    outline: 'none',
    '&::-webkit-slider-thumb': {
      WebkitAppearance: 'none',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #D4AF37, #F5D76E)',
      cursor: 'pointer',
    },
    '&:disabled': {
      opacity: 0.3,
    },
  },
  timeDisplay: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    minWidth: '80px',
    textAlign: 'right',
  },
  info: {
    padding: '24px 0',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#0A0A0A',
  },
  description: {
    fontSize: '15px',
    color: 'rgba(10,10,10,0.4)',
    lineHeight: '1.6',
  },
  videoId: {
    fontSize: '13px',
    color: 'rgba(10,10,10,0.2)',
  },
  qualityBadge: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '6px 16px',
    background: 'rgba(212, 175, 55, 0.06)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'rgba(10,10,10,0.4)',
    border: '1px solid rgba(212, 175, 55, 0.04)',
  },
};

// Add keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default VideoPlayer;