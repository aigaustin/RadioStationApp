import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Howl } from 'howler';

export default function AudioPlayer({ streamUrl, stationName }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    if (streamUrl) {
      soundRef.current = new Howl({
        src: [streamUrl],
        html5: true,
        volume: volume,
        format: ['mp3', 'aac'],
        onloaderror: (id, err) => console.error("Audio error", err),
        onplayerror: (id, err) => console.error("Play error", err)
      });
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [streamUrl]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
    } else {
      soundRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="audio-player-bar">
      <div className="player-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, backgroundColor: 'var(--bg-app)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="https://ui-avatars.com/api/?name=Radio&background=random&color=fff" alt="Cover" style={{ width: '100%', borderRadius: 8 }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Live Audio Feed</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stationName || 'Streamo Core Network'}</div>
        </div>
      </div>

      <div className="player-controls">
        <button className="play-btn" onClick={togglePlay}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
        </button>
      </div>

      <div className="player-volume" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume} 
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="volume-slider"
        />
      </div>
    </div>
  );
}
