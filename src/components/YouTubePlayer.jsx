import React, { useState, useEffect } from 'react';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeSearchUrl } from '../utils/youtubeHelper';

export default function YouTubePlayer({
  day,
  dayTitle,
  videoUrl,
  onSaveVideoUrl,
  onClose
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentVideoId = extractYouTubeId(videoUrl);
  const embedUrl = currentVideoId ? getYouTubeEmbedUrl(currentVideoId) : null;

  useEffect(() => {
    setInputUrl(videoUrl || '');
    setErrorMsg('');
  }, [videoUrl, day]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      onSaveVideoUrl(day, '');
      setIsEditing(false);
      setErrorMsg('');
      return;
    }

    const extracted = extractYouTubeId(inputUrl);
    if (!extracted) {
      setErrorMsg('Invalid YouTube URL or Video ID. Please check the link.');
      return;
    }

    onSaveVideoUrl(day, extracted);
    setIsEditing(false);
    setErrorMsg('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        width: isMinimized ? '300px' : '380px',
        background: 'rgba(16, 20, 24, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(229, 193, 88, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(229, 193, 88, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Player Header */}
      <div
        style={{
          padding: '10px 14px',
          background: 'rgba(229, 193, 88, 0.08)',
          borderBottom: isMinimized ? 'none' : '1px solid rgba(229, 193, 88, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span style={{ fontSize: '16px' }}>📺</span>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-sacred-gold)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              Day {day} Video
            </span>
            {dayTitle && (
              <span style={{ fontSize: '11px', color: 'var(--text-slate)', marginLeft: '6px' }}>
                - {dayTitle}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            title="Edit Video Link"
            onClick={() => {
              setIsEditing(!isEditing);
              if (isMinimized) setIsMinimized(false);
            }}
            style={{
              background: isEditing ? 'var(--color-sacred-gold)' : 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '6px',
              color: isEditing ? 'var(--bg-midnight)' : 'var(--text-slate)',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ✏️
          </button>
          <button
            type="button"
            title={isMinimized ? 'Expand Player' : 'Minimize Player'}
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--text-slate)',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {isMinimized ? '🗖' : '—'}
          </button>
          {onClose && (
            <button
              type="button"
              title="Close Player"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '6px',
                color: 'var(--text-slate)',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Expanded View */}
      {!isMinimized && (
        <div style={{ padding: isEditing ? '14px' : '0' }}>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-ivory)', fontWeight: 600 }}>
                Associate YouTube Video for Day {day}:
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Paste YouTube Video URL or ID (e.g., https://youtu.be/...)"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 10px' }}
              />
              {errorMsg && (
                <span style={{ fontSize: '11px', color: '#FF4D4D' }}>{errorMsg}</span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <a
                  href={getYouTubeSearchUrl(day)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-sacred-gold)',
                    textDecoration: 'underline',
                  }}
                >
                  🔍 Search YouTube for Day {day}
                </a>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                  >
                    Save Video
                  </button>
                </div>
              </div>
            </form>
          ) : embedUrl ? (
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                src={embedUrl}
                title={`Bible in a Year Day ${day} YouTube Video`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-slate)', marginBottom: '12px' }}>
                No video linked for Day {day} yet.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  ➕ Add YouTube Link
                </button>
                <a
                  href={getYouTubeSearchUrl(day)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}
                >
                  🔍 Find Video
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
