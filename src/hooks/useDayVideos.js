import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import defaultYoutubeLinks from '../data/youtube-links.json';
import { extractYouTubeId } from '../utils/youtubeHelper';

export function useDayVideos() {
  const { currentUser } = useAuth();
  const [customVideos, setCustomVideos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setCustomVideos({});
      setLoading(false);
      return;
    }

    const videoDocRef = doc(db, 'userVideos', currentUser.uid);
    const unsubscribe = onSnapshot(
      videoDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setCustomVideos(docSnap.data() || {});
        } else {
          setCustomVideos({});
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching custom day videos:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  /**
   * Gets the video ID or URL for a given day (custom user link first, then default).
   * @param {number|string} day 
   * @returns {string|null}
   */
  const getVideoForDay = (day) => {
    const dayStr = String(day);
    if (customVideos && customVideos[dayStr]) {
      return customVideos[dayStr];
    }
    if (defaultYoutubeLinks && defaultYoutubeLinks[dayStr]) {
      return defaultYoutubeLinks[dayStr];
    }
    return null;
  };

  /**
   * Saves or clears a custom YouTube video for a given day.
   * @param {number|string} day 
   * @param {string} inputUrlOrId 
   */
  const saveVideoUrl = async (day, inputUrlOrId) => {
    if (!currentUser) return;
    const dayStr = String(day);
    const videoId = extractYouTubeId(inputUrlOrId) || inputUrlOrId;

    const updated = {
      ...customVideos,
      [dayStr]: videoId || ''
    };

    try {
      const videoDocRef = doc(db, 'userVideos', currentUser.uid);
      await setDoc(videoDocRef, updated, { merge: true });
    } catch (err) {
      console.error('Failed to save day video URL:', err);
    }
  };

  return {
    getVideoForDay,
    saveVideoUrl,
    loading
  };
}
