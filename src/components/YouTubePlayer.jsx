import React, { useState, useEffect } from 'react';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeWatchUrl, getYouTubeSearchUrl } from '../utils/youtubeHelper';

export default function YouTubePlayer({
  day,
  dayTitle,
  videoUrl,
  onSaveVideoUrl,
  onDeleteVideoUrl,
  onClose
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentVideoId = extractYouTubeId(videoUrl);
  const embedUrl = currentVideoId ? getYouTubeEmbedUrl(currentVideoId) : null;
  const watchUrl = currentVideoId ? getYouTubeWatchUrl(currentVideoId) : getYouTubeSearchUrl(day);

  useEffect(() => {
    setInputUrl(videoUrl || '');
    setErrorMsg('');
  }, [videoUrl, day]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      handleDelete();
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

  const handleDelete = () => {
    if (onDeleteVideoUrl) {
      onDeleteVideoUrl(day);
    } else if (onSaveVideoUrl) {
      onSaveVideoUrl(day, '');
    }
    setInputUrl('');
    setIsEditing(false);
    setErrorMsg('');
  };

  const handlePopout = () => {
    if (!watchUrl) return;
    window.open(watchUrl, 'YouTubePopout', 'width=780,height=440,resizable=yes,scrollbars=yes');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        width: isMinimized ? '300px' : '390px',
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
          {currentVideoId && (
            <button
              type="button"
              title="Pop-out Floating Video Window"
              onClick={handlePopout}
              style={{
                background: 'rgba(229, 193, 88, 0.15)',
                border: '1px solid rgba(229, 193, 88, 0.3)',
                borderRadius: '6px',
                color: 'var(--color-sacred-gold)',
                padding: '2px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                gap: '2px',
              }}
            >
              ↗️ Pop-out
            </button>
          )}
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
        <div>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px' }}>
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
                  🔍 Search YouTube
                </a>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      title="Clear saved video for this day"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#FCA5A5',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Clear
                    </button>
                  )}
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
                    Save
                  </button>
                </div>
              </div>
            </form>
          ) : embedUrl ? (
            <div>
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
                  referrerPolicy="origin"
                  allowFullScreen
                />
              </div>
              <div style={{
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderTop: '1px solid rgba(229, 193, 88, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  If video playback is disabled by owner:
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handlePopout}
                    style={{
                      background: 'rgba(229, 193, 88, 0.15)',
                      border: '1px solid rgba(229, 193, 88, 0.3)',
                      borderRadius: '4px',
                      color: 'var(--color-sacred-gold)',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    ↗️ Pop-out Window
                  </button>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--color-sacred-gold)',
                      fontSize: '10px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Watch on YouTube ↗
                  </a>
                </div>
              </div>
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
