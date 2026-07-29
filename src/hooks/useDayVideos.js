import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, deleteField } from 'firebase/firestore';
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
   * Checks if a day has a custom user-saved video.
   * @param {number|string} day 
   * @returns {boolean}
   */
  const hasCustomVideo = (day) => {
    const dayStr = String(day);
    return Boolean(customVideos && customVideos[dayStr]);
  };

  /**
   * Saves or updates a custom YouTube video for a given day.
   * @param {number|string} day 
   * @param {string} inputUrlOrId 
   */
  const saveVideoUrl = async (day, inputUrlOrId) => {
    if (!currentUser) return;
    const dayStr = String(day);
    const videoId = extractYouTubeId(inputUrlOrId) || inputUrlOrId;

    if (!videoId || !videoId.trim()) {
      return deleteVideoUrl(day);
    }

    const updated = {
      ...customVideos,
      [dayStr]: videoId
    };

    try {
      const videoDocRef = doc(db, 'userVideos', currentUser.uid);
      await setDoc(videoDocRef, updated, { merge: true });
    } catch (err) {
      console.error('Failed to save day video URL:', err);
    }
  };

  /**
   * Deletes/clears the custom saved YouTube video URL for a given day in Firestore.
   * @param {number|string} day 
   */
  const deleteVideoUrl = async (day) => {
    if (!currentUser) return;
    const dayStr = String(day);

    try {
      const videoDocRef = doc(db, 'userVideos', currentUser.uid);
      await setDoc(videoDocRef, {
        [dayStr]: deleteField()
      }, { merge: true });
    } catch (err) {
      console.error('Failed to delete day video URL:', err);
    }
  };

  return {
    getVideoForDay,
    hasCustomVideo,
    saveVideoUrl,
    deleteVideoUrl,
    loading
  };
}
