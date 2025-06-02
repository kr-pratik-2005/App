import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, Calendar } from 'lucide-react';

const ThemeManagement = () => {
  // Get current week number and date range
  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7).toString().padStart(2, '0');
  };

  const getWeekDateRange = (weekNum) => {
    const year = new Date().getFullYear();
    const firstDay = new Date(year, 0, 1);
    const daysToAdd = (parseInt(weekNum) - 1) * 7 - firstDay.getDay();
    const weekStart = new Date(firstDay.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };
    
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  const [weekTheme, setWeekTheme] = useState(getCurrentWeekNumber());
  const [themes, setThemes] = useState(['Animals', 'Plants']);
  const [languages, setLanguages] = useState(['A', 'B', 'C']);
  const [numeracy, setNumeracy] = useState(['1', '2']);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleRemoveTag = (category, tagToRemove) => {
    switch(category) {
      case 'themes':
        setThemes(themes.filter(theme => theme !== tagToRemove));
        break;
      case 'languages':
        setLanguages(languages.filter(lang => lang !== tagToRemove));
        break;
      case 'numeracy':
        setNumeracy(numeracy.filter(num => num !== tagToRemove));
        break;
    }
  };

  const handleReset = () => {
    const currentWeek = getCurrentWeekNumber();
    setWeekTheme(currentWeek);
    setThemes(['Animals', 'Plants']);
    setLanguages(['A', 'B', 'C']);
    setNumeracy(['1', '2']);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', {
      week: weekTheme,
      themes,
      languages,
      numeracy
    });
  };

  const styles = {
    container: {
      maxWidth: isMobile ? '375px' : '100%',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '16px 20px' : '24px 40px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e9ecef',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    backButton: {
      background: 'none',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      marginRight: '12px',
    },
    headerTitle: {
      fontSize: isMobile ? '18px' : '24px',
      fontWeight: '600',
      color: '#212529',
      margin: 0,
    },
    content: {
      flex: 1,
      padding: isMobile ? '20px' : '40px',
      maxWidth: isMobile ? 'none' : '800px',
      margin: isMobile ? '0' : '0 auto',
      width: '100%',
      boxSizing: 'border-box',
    },
    section: {
      marginBottom: isMobile ? '24px' : '32px',
    },
    weekSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '16px' : '24px',
      marginBottom: isMobile ? '24px' : '32px',
    
    },
    weekLabel: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      color: '#212529',
      minWidth: isMobile ? 'auto' : '80px',
    },
    weekInputContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    weekInput: {
      width: isMobile ? '60px' : '80px',
      padding: isMobile ? '12px 16px' : '16px 20px',
      border: '1px solid #dee2e6',
      borderRadius: isMobile ? '20px' : '24px',
      fontSize: isMobile ? '16px' : '18px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      fontWeight: '500',
    },
    dateRange: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: isMobile ? '12px 16px' : '16px 20px',
      backgroundColor: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: isMobile ? '20px' : '24px',
      fontSize: isMobile ? '14px' : '16px',
      color: '#6c757d',
    },
    themeContainer: {
      
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '16px' : '24px',
      
    },
    themeRow: {
      display: 'flex',
      alignItems: isMobile ? 'center' : 'flex-start',
      gap: isMobile ? '12px' : '24px',
      marginBottom: isMobile ? '24px' : '32px',
      flexDirection: isMobile ? 'row' : 'row',
    },
    themeLabel: {
      fontSize: isMobile ? '16px' : '18px',
      color: '#212529',
      fontWeight: '600',
      minWidth: isMobile ? 'auto' : '150px',
      alignSelf: isMobile ? 'center' : 'center',
    },
    themeValue: {
      flex: 1,
      width: '100%',
    },
    tagContainer: {
      display: 'flex',
      gap: isMobile ? '8px' : '12px',
      flexWrap: 'wrap',
      padding: isMobile ? '12px 16px' : '16px 20px',
      backgroundColor: '#ffffff',
      borderRadius: isMobile ? '20px' : '24px',
      border: '1px solid #e9ecef',
      minHeight: isMobile ? '40px' : '50px',
      alignItems: 'center',
    },
    tag: {
      backgroundColor: '#ffffff',
      color: '#6c757d',
      backgroundColor: '#E9E5E5',
      padding: isMobile ? '8px 12px' : '10px 16px',
      borderRadius: isMobile ? '16px' : '20px',
      fontSize: isMobile ? '14px' : '16px',
      border: '1px solid #dee2e6',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontWeight: '500',
    },
    removeTag: {
      background: 'none',
      border: 'none',
      color: '#6c757d',
      cursor: 'pointer',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      opacity: 0.7,
    },
    buttonContainer: {
      position: isMobile ? 'fixed' : 'static',
      bottom: isMobile ? '20px' : 'auto',
      left: isMobile ? '20px' : 'auto',
      right: isMobile ? '20px' : 'auto',
      maxWidth: isMobile ? '335px' : '800px',
      margin: isMobile ? '0 auto' : '40px auto 0',
      display: 'flex',
      gap: isMobile ? '12px' : '16px',
      padding: isMobile ? '0' : '0 40px',
      justifyContent: isMobile ? 'stretch' : 'flex-end',
    },
    button: {
      padding: isMobile ? '14px 24px' : '16px 32px',
      borderRadius: isMobile ? '20px' : '24px',
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      minWidth: isMobile ? 'auto' : '120px',
    },
    resetButton: {
      backgroundColor: '#ffffff',
      color: '#565657',
      border: '1px solid #dee2e6',
      flex: isMobile ? 1 : 'none',
    },
    submitButton: {
      backgroundColor: '#D3F26A',
      color: '#565657',
      flex: isMobile ? 1 : 'none',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton}>
          <ChevronLeft size={isMobile ? 24 : 28} color="#212529" />
        </button>
        <h1 style={styles.headerTitle}>Theme of the week</h1>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Week Selection */}
        <div style={styles.weekSection}>
          <span style={styles.weekLabel}>Week :</span>
          <div style={styles.weekInputContainer}>
            <input
              type="number"
              value={weekTheme}
              onChange={(e) => setWeekTheme(e.target.value)}
              style={styles.weekInput}
              min="1"
              max="52"
            />
            <div style={styles.dateRange}>
              <span>{getWeekDateRange(weekTheme)}</span>
              <Calendar size={isMobile ? 16 : 18} color="#6c757d" />
            </div>
          </div>
        </div>

        {/* Theme Container */}
        <div style={styles.themeContainer}>
          {/* Theme of the week */}
          <div style={styles.themeRow}>
            <span style={styles.themeLabel}>
              Theme of 
              {isMobile ? <br /> : ' '}
              the week :
            </span>

            <div style={styles.themeValue}>
              <div style={styles.tagContainer}>
                {themes.map((theme, index) => (
                  <div key={index} style={styles.tag}>
                    {theme}
                    <button 
                      style={styles.removeTag}
                      onClick={() => handleRemoveTag('themes', theme)}
                    >
                      <X size={isMobile ? 14 : 16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Language */}
          <div style={styles.themeRow}>
            <span style={styles.themeLabel}>Language :</span>
            <div style={styles.themeValue}>
              <div style={styles.tagContainer}>
                {languages.map((lang, index) => (
                  <div key={index} style={styles.tag}>
                    {lang}
                    <button 
                      style={styles.removeTag}
                      onClick={() => handleRemoveTag('languages', lang)}
                    >
                      <X size={isMobile ? 14 : 16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Numeracy */}
          <div style={styles.themeRow}>
            <span style={styles.themeLabel}>Numeracy :</span>
            <div style={styles.themeValue}>
              <div style={styles.tagContainer}>
                {numeracy.map((num, index) => (
                  <div key={index} style={styles.tag}>
                    {num}
                    <button 
                      style={styles.removeTag}
                      onClick={() => handleRemoveTag('numeracy', num)}
                    >
                      <X size={isMobile ? 14 : 16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div style={styles.buttonContainer}>
        <button 
          style={{...styles.button, ...styles.resetButton}}
          onClick={handleReset}
        >
          Reset
        </button>
        <button 
          style={{...styles.button, ...styles.submitButton}}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ThemeManagement;