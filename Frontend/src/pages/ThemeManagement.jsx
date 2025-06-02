// src/pages/ThemeManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const ThemeManagement = () => {
  const navigate = useNavigate();

  // State for Theme of the Week tags & Theme of the Day selections
  const [tags, setTags] = useState([]);
  const [dayThemes, setDayThemes] = useState([]);

  // State for today's Common Parents Note
  const [noteInput, setNoteInput] = useState('');

  // Temp input for adding a new tag
  const [tagInput, setTagInput] = useState('');

  // Helper: get today's date as YYYY‑MM‑DD in local time
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  // Load tags, dayThemes, and today's commonParentsNote
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Build the same doc reference inside the effect
        const themeDocRef = doc(db, 'appConfig', 'themeOfTheWeek');
        const snap = await getDoc(themeDocRef);
        if (!snap.exists()) return;
        const data = snap.data();

        setTags(data.theme || []);
        setDayThemes(data.themeOfTheDay || []);

        // Only prefill if it was saved today
        if (data.commonParentsNoteDate === todayStr) {
          setNoteInput(data.commonParentsNote || '');
        } else {
          setNoteInput('');
        }
      } catch (err) {
        console.error('Error loading config:', err);
      }
    };

    loadConfig();
  }, [todayStr]);

  // Helper to merge updates into the same config document
  const saveConfig = async (update) => {
    try {
      const themeDocRef = doc(db, 'appConfig', 'themeOfTheWeek');
      await setDoc(themeDocRef, update, { merge: true });
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  // Tag management
  const addTag = async () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    const newTags = [...tags, t];
    setTags(newTags);
    setTagInput('');
    await saveConfig({ theme: newTags });
  };

  const removeTag = async (tag) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    await saveConfig({ theme: newTags });

    // If it was in today's selection, remove it too
    if (dayThemes.includes(tag)) {
      const newDay = dayThemes.filter(t => t !== tag);
      setDayThemes(newDay);
      await saveConfig({ themeOfTheDay: newDay });
    }
  };

  // Theme-of-the-Day checkbox handler
  const handleDayThemeChange = async (e, tag) => {
    const checked = e.target.checked;
    const newDay = checked
      ? [...dayThemes, tag]
      : dayThemes.filter(t => t !== tag);

    setDayThemes(newDay);
    await saveConfig({ themeOfTheDay: newDay });
  };

  // Save today's Common Parents Note with a date stamp
  const saveCommonNote = async () => {
    await saveConfig({
      commonParentsNote: noteInput,
      commonParentsNoteDate: todayStr
    });
  };

  // === styles ===
  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Inter, Arial, sans-serif',
      background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
      minHeight: '100vh',
    },
    header: { marginBottom: '20px', textAlign: 'center' },
    title: { fontSize: '28px', color: '#d62828' },
    section: {
      marginBottom: '40px',
      padding: '10px 20px',
      backgroundColor: '#fffbee',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
      fontSize: '20px',
      color: '#0077b6',
      borderBottom: '1px solid #0077b6',
      paddingBottom: '5px',
      marginBottom: '15px',
    },
    inputRow: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '15px',
    },
    tagInput: {
      width: '70%',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '16px',
      marginRight: '10px',
    },
    addButton: {
      backgroundColor: '#ffba08',
      color: '#333',
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '5px',
      justifyContent: 'center',
    },
    tag: {
      backgroundColor: '#0077b6',
      color: '#fff',
      padding: '5px 10px',
      borderRadius: '12px',
      fontSize: '14px',
      cursor: 'pointer',
    },
    checkboxList: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    checkboxItem: {
      fontSize: '16px',
      marginBottom: '8px',
      cursor: 'pointer',
    },
    noteTextarea: {
      width: '80%',
      minHeight: '80px',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '16px',
      margin: '0 auto 10px',
      display: 'block',
    },
    saveNoteBtn: {
      backgroundColor: '#4caf50',
      color: 'white',
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      display: 'block',
      margin: '0 auto',
    },
    backButton: {
      backgroundColor: '#f94144',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginTop: '20px',
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Theme Management</h1>
      </header>

      {/* Theme of the Week */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Theme of the Week</h2>
        <div style={styles.inputRow}>
          <input
            type="text"
            style={styles.tagInput}
            placeholder="Enter a tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <button style={styles.addButton} onClick={addTag}>
            Add Tag
          </button>
        </div>
        <div style={styles.tagContainer}>
          {tags.map(tag => (
            <span key={tag} style={styles.tag} onClick={() => removeTag(tag)}>
              {tag} &times;
            </span>
          ))}
        </div>
      </div>

      {/* Theme of the Day */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Theme of the Day</h2>
        <div style={styles.checkboxList}>
          {tags.length
            ? tags.map(tag => (
                <label key={tag} style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={dayThemes.includes(tag)}
                    onChange={e => handleDayThemeChange(e, tag)}
                    style={{ marginRight: '8px' }}
                  />
                  {tag}
                </label>
              ))
            : <p>No tags created yet.</p>}
        </div>
      </div>

      {/* Common Parents Note */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Common Note for Parents</h2>
        <textarea
          style={styles.noteTextarea}
          placeholder="This note will appear on every Daily Report"
          value={noteInput}
          onChange={e => setNoteInput(e.target.value)}
        />
        <button style={styles.saveNoteBtn} onClick={saveCommonNote}>
          Save Common Note
        </button>
      </div>

      <button style={styles.backButton} onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
};

export default ThemeManagement;
