import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

/**
 * Converts a time string stored in AM/PM format (e.g. "2:30 PM")
 * to the 24-hour format (e.g. "14:30") required for <input type="time">
 */
function convertTo24HourFormat(timeStr) {
  if (!timeStr) return "";
  const [time, modifier] = timeStr.split(' ');
  if (!modifier) return timeStr;
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Converts a 24‑hour time string (e.g. "14:30")
 * into a 12‑hour AM/PM string (e.g. "2:30 PM")
 */
function convertTo12HourFormat(time24) {
  if (!time24) return "";
  let [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;              // convert "0" → 12, "13" → 1, etc.
  return `${hour}:${minute} ${suffix}`;
}

const Report = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    childName: '',
    emails: [],
    inTime: '',
    outTime: '',
    snack: '',
    meal: '',
    sleepFrom: '',
    sleepTo: '',
    sleepNot: false,
    noDiaper: false,
    diaperChanges: '',
    toiletVisits: '',
    poops: '',
    feelings: [],
    notes: '',
    themeOfTheDay: [],
    ouch: false,
    ouchReport: '',
    commonParentsNote: ''
  });
  const [availableThemes, setAvailableThemes] = useState([]);

  const feelingsOptions = [
    { label: 'Happy', emoji: '😊' },
    { label: 'Sad', emoji: '😢' },
    { label: 'Restless', emoji: '😕' },
    { label: 'Quiet', emoji: '😌' },
    { label: 'Playful', emoji: '😜' },
    { label: 'Sick', emoji: '🤒' }
  ];
  const radioOptions = [0, 1, 2, 3, 4];

  // Fetch available themes
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themeRef = doc(db, 'appConfig', 'themeOfTheWeek');
        const snap = await getDoc(themeRef);
        if (snap.exists()) {
          const data = snap.data();
          let themes = [];
          if (Array.isArray(data.theme)) {
            themes = data.theme;
          } else if (typeof data.theme === 'string' && data.theme.trim()) {
            themes = data.theme.split(',').map(t => t.trim());
          }
          setAvailableThemes(themes);
        }
      } catch (err) {
        console.error('Error fetching themes:', err);
      }
    };
    fetchThemes();
  }, []);

  // Fetch reports and attendance for selected date
  useEffect(() => {
    const fetchReportsAndAttendance = async () => {
      const dateObj = new Date(selectedDate);
      const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1);
      
      try {
        // Fetch daily reports
        const reportsQuery = query(
          collection(db, 'dailyReports'),
          where('date', '>=', startOfDay),
          where('date', '<', endOfDay)
        );
        const reportsSnap = await getDocs(reportsQuery);
        const dailyReports = {};
        reportsSnap.docs.forEach(d => {
          const data = d.data();
          dailyReports[data.childName] = { id: d.id, ...data };
        });

        // Fetch attendance data
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '>=', startOfDay),
          where('date', '<', endOfDay)
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        let presentChildren = [];
        
        attendanceSnap.forEach(docSnap => {
          const data = docSnap.data();
          if (data && data.attendance) {
            Object.entries(data.attendance).forEach(([childName, attendanceInfo]) => {
              if (attendanceInfo.status === 'present') {
                presentChildren.push(childName);
              }
            });
          }
        });

        // Fetch kids info to get email addresses
        const kidsSnapshot = await getDocs(collection(db, 'kidsInfo'));
        const kidsInfo = {};
        kidsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          kidsInfo[data.name] = data;
        });

        // Create combined reports array
        const combinedReports = presentChildren.map(childName => {
          const existingReport = dailyReports[childName];
          const kidInfo = kidsInfo[childName] || {};
          
          if (existingReport) {
            // Child has a submitted report
            return existingReport;
          } else {
            // Child is present but no report submitted yet - create placeholder
            const emails = [];
            if (kidInfo.email) emails.push(kidInfo.email);
            if (kidInfo.email2) emails.push(kidInfo.email2);
            
            return {
              id: null, // No report submitted yet
              childName: childName,
              emails: emails,
              date: startOfDay,
              hasReport: false,
              // Default values for form
              inTime: '',
              outTime: '',
              snack: '',
              meal: '',
              sleepFrom: '',
              sleepTo: '',
              sleepNot: false,
              noDiaper: false,
              diaperChanges: '',
              toiletVisits: '',
              poops: '',
              feelings: [],
              notes: '',
              themeOfTheDay: [],
              ouch: false,
              ouchReport: '',
              commonParentsNote: ''
            };
          }
        });

        setReports(combinedReports);
      } catch (err) {
        console.error('Error fetching reports and attendance:', err);
      }
    };
    
    fetchReportsAndAttendance();
  }, [selectedDate]);

  // When a report is clicked, load into form
  const handleReportSelect = report => {
    setSelectedReport(report);
    let emailsArr = [];
    if (Array.isArray(report.emails) && report.emails.length) {
      emailsArr = report.emails;
    } else {
      if (report.email) emailsArr.push(report.email);
      if (report.email2) emailsArr.push(report.email2);
    }
    setFormData({
      childName: report.childName || '',
      emails: emailsArr,
      inTime: convertTo24HourFormat(report.inTime),
      outTime: convertTo24HourFormat(report.outTime),
      snack: report.snack || '',
      meal: report.meal || '',
      sleepFrom: convertTo24HourFormat(report.sleepFrom),
      sleepTo: convertTo24HourFormat(report.sleepTo),
      sleepNot: report.sleepNot || false,
      noDiaper: report.noDiaper || false,
      diaperChanges: report.diaperChanges || '',
      toiletVisits: report.toiletVisits || '',
      poops: report.poops || '',
      feelings: Array.isArray(report.feelings)
        ? report.feelings
        : typeof report.feelings === 'string'
          ? report.feelings.split(',').map(f => f.trim())
          : [],
      notes: report.notes || '',
      themeOfTheDay: Array.isArray(report.themeOfTheDay)
        ? report.themeOfTheDay
        : typeof report.themeOfTheDay === 'string'
          ? report.themeOfTheDay.split(',').map(t => t.trim())
          : [],
      ouch: report.ouch || false,
      ouchReport: report.ouchReport || '',
      commonParentsNote: report.commonParentsNote || ''
    });
  };

  // Form change handler
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'sleepNot') {
      setFormData(prev => ({ ...prev, sleepNot: checked, sleepFrom: '', sleepTo: '' }));
    } else if (type === 'checkbox' && name === 'feelings') {
      setFormData(prev => prev.feelings.includes(value)
        ? { ...prev, feelings: prev.feelings.filter(f => f !== value) }
        : { ...prev, feelings: [...prev.feelings, value] }
      );
    } else if (type === 'checkbox' && name === 'themeOfTheDay') {
      setFormData(prev => prev.themeOfTheDay.includes(value)
        ? { ...prev, themeOfTheDay: prev.themeOfTheDay.filter(t => t !== value) }
        : { ...prev, themeOfTheDay: [...prev.themeOfTheDay, value] }
      );
    } else if (type === 'checkbox' && name === 'ouch') {
      setFormData(prev => ({ ...prev, ouch: checked, ouchReport: checked ? prev.ouchReport : '' }));
    } else if (type === 'checkbox' && name === 'noDiaper') {
      setFormData(prev => ({
        ...prev,
        noDiaper: checked,
        diaperChanges: checked ? '' : prev.diaperChanges,
        toiletVisits: checked ? prev.toiletVisits : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Update or Create Report in Firestore
  const handleUpdate = async e => {
    e.preventDefault();
    try {
      const reportData = {
        childName: formData.childName,
        emails: formData.emails,
        inTime: convertTo12HourFormat(formData.inTime),
        outTime: convertTo12HourFormat(formData.outTime),
        snack: formData.snack,
        meal: formData.meal,
        sleepFrom: convertTo12HourFormat(formData.sleepFrom),
        sleepTo: convertTo12HourFormat(formData.sleepTo),
        sleepNot: formData.sleepNot,
        noDiaper: formData.noDiaper,
        diaperChanges: formData.diaperChanges,
        toiletVisits: formData.toiletVisits,
        poops: formData.poops,
        feelings: formData.feelings,
        notes: formData.notes,
        themeOfTheDay: formData.themeOfTheDay,
        ouch: formData.ouch,
        ouchReport: formData.ouchReport,
        commonParentsNote: formData.commonParentsNote,
        date: new Date(selectedDate)
      };

      if (selectedReport.id) {
        // Update existing report
        const ref = doc(db, 'dailyReports', selectedReport.id);
        await updateDoc(ref, reportData);
        alert('Report updated successfully!');
      } else {
        // Create new report
        await addDoc(collection(db, 'dailyReports'), reportData);
        alert('Report created successfully!');
      }
      
      setSelectedReport(null);
      // Refresh the reports list
      window.location.reload();
    } catch (err) {
      console.error('Error updating/creating report:', err);
      alert('Failed to save report.');
    }
  };

  // Styles
  const styles = {
    container: { padding: '20px', fontFamily: 'Inter, Arial, sans-serif', background: 'linear-gradient(135deg, #ffecd2, #fcb69f)', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '20px', color: '#A62C2C' },
    datePickerContainer: { textAlign: 'center', marginBottom: '20px' },
    datePicker: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc' },
    gridContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' },
    reportBox: { 
      width: '150px', 
      height: '150px', 
      backgroundColor: '#fffbee', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      borderRadius: '8px', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
      cursor: 'pointer', 
      textAlign: 'center',
      position: 'relative'
    },
    reportStatus: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      fontSize: '12px',
      padding: '2px 6px',
      borderRadius: '10px',
      fontWeight: 'bold'
    },
    reportStatusSubmitted: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    reportStatusPending: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    formContainer: { backgroundColor: '#fffbee', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', maxWidth: '700px', margin: '0 auto' },
    label: { fontWeight: '600', marginBottom: '5px', display: 'block' },
    input: { width: '95%', padding: '12px',	marginBottom: '15px', borderRadius: '8px', border: '1px solid #ffc107', fontSize: '15px', outline: 'none' },
    inputTime: { width: '90%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ffc107', fontSize: '15px', outline: 'none' },
    radioGroup: { display: 'flex', gap: '10px', marginBottom: '15px' },
    inlineContainer: { display: 'flex', gap: '30px', marginBottom: '15px' },
    button: { width: '100%', background: '#fcb69f', color: '#4e342e', fontWeight: '600', fontSize: '16px', padding: '15px', border: 'none', borderRadius: '30px', cursor: 'pointer', marginBottom: '10px' },
    backButton: { backgroundColor: '#A62C2C', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'block', margin: '20px auto 0' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Daily Reports</h1>
      {!selectedReport ? (
        <>
          <div style={styles.datePickerContainer}>
            <label htmlFor='report-date' style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Date:</label>
            <input
              type='date'
              id='report-date'
              style={styles.datePicker}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          {reports.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No children were present on the selected date.</p>
          ) : (
            <div style={styles.gridContainer}>
              {reports.map((report, idx) => {
                const colors = ['#A0C4FF','#FFD6A5','#FFC6FF','#FDFFB6','#CAFFBF','#9BF6FF','#BDB2FF','#FFC6FF'];
                const hasSubmittedReport = report.id !== null;
                
                return (
                  <div
                    key={`${report.childName}-${idx}`}
                    style={{ ...styles.reportBox, backgroundColor: colors[idx % colors.length] }}
                    onClick={() => handleReportSelect(report)}
                  >
                    <div 
                      style={{
                        ...styles.reportStatus,
                        ...(hasSubmittedReport ? styles.reportStatusSubmitted : styles.reportStatusPending)
                      }}
                    >
                      {hasSubmittedReport ? '✓' : '!'}
                    </div>
                    <strong>{report.childName}</strong>
                    <div style={{ fontSize: '10px', marginTop: '5px' }}>
                      {hasSubmittedReport ? 'Report Submitted' : 'Pending Report'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button style={styles.backButton} onClick={() => navigate('/')}>Back to Home</button>
        </>
      ) : (
        <form style={styles.formContainer} onSubmit={handleUpdate}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#4e342e' }}>
            {selectedReport.id ? 'Update Daily Report' : 'Create Daily Report'}
          </h2>

          <label style={styles.label}>Child's Name</label>
          <input type='text' name='childName' style={{ ...styles.input, backgroundColor: '#e9ecef' }} value={formData.childName} readOnly />

          {formData.emails.length > 0 && (
            <>  
              <label style={styles.label}>Email{formData.emails.length > 1 ? 's' : ''}</label>
              {formData.emails.map((em,i) => (
                <input key={i} type='text' readOnly value={em} style={{ ...styles.input, backgroundColor: '#e9ecef' }} />
              ))}
            </>
          )}

          {/* In/Out Time */}
          <label style={styles.label}>In and Out Time</label>
          <div style={styles.inlineContainer}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>In</label>
              <input type='time' name='inTime' style={styles.inputTime}  value={formData.inTime} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Out</label>
              <input type='time' name='outTime' style={styles.inputTime}  value={formData.outTime} onChange={handleChange} />
            </div>
          </div>

          {/* Snack and Meal */}
          <label style={styles.label}>Child ate Snacks</label>
          <div style={styles.radioGroup}>
            {['None', 'Some', 'Half', 'Most', 'All'].map(opt => (
              <label key={opt} style={{ fontWeight: '500' }}>
               <input
  type='radio'
  name='snack'
  value={opt}
  onChange={handleChange}
  checked={formData.snack===opt}
/> {opt}
              </label>
            ))}
          </div>
          <label style={styles.label}>Child ate Meals</label>
          <div style={styles.radioGroup}>
            {['None', 'Some', 'Half', 'Most', 'All'].map(opt => (
              <label key={opt} style={{ fontWeight: '500' }}>
                <input
  type='radio'
  name='meal'
  value={opt}
  onChange={handleChange}
  checked={formData.meal===opt}
/> {opt}
              </label>
            ))}
          </div>

          {/* Sleep */}
          <label style={styles.label}>Child Slept</label>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '500' }}>
              <input type='checkbox' name='sleepNot' checked={formData.sleepNot} onChange={handleChange} /> Child did not sleep in school
            </label>
          </div>
          <div style={styles.inlineContainer}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>From</label>
              <input
  type='time'
  name='sleepFrom'
  style={styles.inputTime}
  value={formData.sleepFrom}
  onChange={handleChange}
  disabled={formData.sleepNot}
/>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>To</label>
              <input
  type='time'
  name='sleepTo'
  style={styles.inputTime}
  value={formData.sleepTo}
  onChange={handleChange}
  disabled={formData.sleepNot}
/>
            </div>
          </div>

          {/* No Diaper */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <input type='checkbox' name='noDiaper' checked={formData.noDiaper} onChange={handleChange} style={{ marginRight: '10px' }} /> No Diaper
            </label>
          </div>

          {/* Conditional Diaper vs Toilet Visits */}
          {formData.noDiaper ? (
            <>
              <label style={styles.label}>Toilet Visits</label>
              <div style={styles.radioGroup}>
                {radioOptions.map(opt => (
                  <label key={opt} style={{ fontWeight: '500' }}>
                    <input type='radio' name='toiletVisits' value={String(opt)} onChange={handleChange} checked={formData.toiletVisits===String(opt)}  /> {opt}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <>
              <label style={styles.label}>Diaper Changes</label>
              <div style={styles.radioGroup}>
                {radioOptions.map(opt => (
                  <label key={opt} style={{ fontWeight: '500' }}>
                    <input type='radio' name='diaperChanges' value={String(opt)} onChange={handleChange} checked={formData.diaperChanges===String(opt)}  /> {opt}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Bowel movements */}
          <label style={styles.label}>Bowel movements</label>
          <div style={styles.radioGroup}>
            {radioOptions.map(opt => (
              <label key={opt} style={{ fontWeight: '500' }}>
                <input type='radio' name='poops' value={String(opt)} onChange={handleChange} checked={formData.poops===String(opt)}  /> {opt}
              </label>
            ))}
          </div>

          {/* Feelings */}
          <label style={styles.label}>Child was Feeling</label>
          <div style={{ marginBottom: '20px' }}>
            {feelingsOptions.map(opt => (
              <label key={opt.label} style={{ fontWeight: '500', marginRight: '20px' }}>
                <input type='checkbox' name='feelings' value={opt.label} onChange={handleChange} checked={formData.feelings.includes(opt.label)} /> {opt.label} {opt.emoji}
              </label>
            ))}
          </div>

          {/* Theme of the Day */}
          <label style={styles.label}>Theme of the Day</label>
          <div style={{ marginBottom: '20px' }}>
            {availableThemes.length > 0 ? availableThemes.map(opt => (
              <label key={opt} style={{ fontWeight: '500', marginRight: '10px' }}>
                <input type='checkbox' name='themeOfTheDay' value={opt} onChange={handleChange} checked={formData.themeOfTheDay.includes(opt)} /> {opt}
              </label>
            )) : <p>No themes available</p>}
          </div>

          {/* Notes */}
          <label style={styles.label}>Teacher's Note</label>
          <textarea name='notes' rows='3' style={styles.input} value={formData.notes} onChange={handleChange} />

          {/* Ouch Report */}
          <div style={{ marginBottom: '15px' }}>
            <label style={styles.label}>
              <input type="checkbox" name="ouch" checked={formData.ouch} onChange={handleChange} /> Ouch Report
            </label>
            {formData.ouch && (
              <textarea name="ouchReport" rows="3" style={styles.input} value={formData.ouchReport} onChange={handleChange} placeholder="Describe the ouch report..." />
            )}
          </div>

          {/* Common Parents Note (conditional) */}
          {formData.commonParentsNote && (
            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Common Note for Parents</label>
              <textarea name="commonParentsNote" rows="3" style={styles.input} value={formData.commonParentsNote} onChange={handleChange} placeholder="Common note for parents" />
            </div>
          )}

          <button type="submit" style={styles.button}>
            {selectedReport.id ? 'Update Report' : 'Create Report'}
          </button>
          <button type="button" style={styles.backButton} onClick={() => setSelectedReport(null)}>Back to Reports List</button>
        </form>
      )}
    </div>
  );
};

export default Report;