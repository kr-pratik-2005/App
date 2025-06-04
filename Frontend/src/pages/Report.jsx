import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
 const navigate = useNavigate();

  const handleChildRecordClick = () => {
    console.log('Child Record clicked');
     navigate('/child-data')
    // Navigate to child record page
  };

  const handleDailyReportClick = () => {
    console.log('Daily Report clicked');
    navigate('/daily-report')
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '40px',
      paddingTop: '10px'
    },
    backButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
      marginRight: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#333333',
      margin: 0,
      flex: 1,
      textAlign: 'center',
      marginRight: '48px' // Compensate for back button width to center title
    },
    cardsContainer: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexDirection:'row',
      maxWidth: '500px',
      margin: '0 auto'
    },
    card: {
      width: '200px',
      height: '200px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: 'none',
      fontSize: '24px',
      fontWeight: '600',
      color: 'white',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    childRecordCard: {
      backgroundColor: '#5A68B1' // Purple/indigo color
    },
    dailyReportCard: {
      backgroundColor: '#E57C2F' // Orange color
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={styles.backButton}
         
          onClick={() => navigate('/')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={24} color="#666"/>
        </button>
        <h1 style={styles.title}>Reports</h1>
      </div>
      
      <div style={styles.cardsContainer}>
        <button
          style={{...styles.card, ...styles.childRecordCard}}
          onClick={handleChildRecordClick}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          Child<br />Record
        </button>
        
        <button
          style={{...styles.card, ...styles.dailyReportCard}}
          onClick={handleDailyReportClick}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          Daily<br />Report
        </button>
      </div>
    </div>
  );
};

export default ReportsPage;