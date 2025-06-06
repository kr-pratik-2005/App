import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { collection, query, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const ChildData = () => {
  const navigate = useNavigate();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const childFromUrl = urlParams.get('child') || '';
  
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    emergencyDetails: false,
    medicalInfo: false,
    developmentalInfo: false,
    dailyRoutine: false,  
    additionalInfo: false 
  });
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    bloodGroup: '',
    nickName: '',
    language: '',
    mobileNumber: '',
    address: '',
    email: '',
    email2: '',
    medicalNotes: '',
    allergies: '',
    medicationDetails: '',
    medicationNeeds: '',
    dietaryRestrictions: '',
    developmentNotes: '',
    pottyTrained: '',
    sleepTrained: '',
    eatsIndependently: '',
    attendedDaycare: '',
    previousDaycareDetails: '',
    likesAndDislikes: '',
    enjoyedActivities: '',
    triggersAndCalming: '',
    behaviorWithOtherChildren: '',
    learningStyleInfo: '',
    dailyRoutine: '',
    sleepSchedule: '',
    mealSchedule: '',
    mealPreferences: '',
    culturalPractices: '',
    communicationForFeelings: '',
    additionalInfo: '',
    expectations: ''
  });

  // Fetch all children from kidsInfo collection
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const kidsSnapshot = await getDocs(collection(db, 'kidsInfo'));
        const childrenData = [];
        
        kidsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          childrenData.push({
            id: doc.id,
            name: data.name,
            dob: data.dob || '',
            bloodGroup: data.bloodGroup || '',
            nickName: data.nickName || data.name,
            language: data.language || '',
            mobileNumber: data.mobileNumber || '',
            address: data.address || '',
            email: data.email || '',
            email2: data.email2 || '',
            hasCompleteData: !!(data.dob && data.bloodGroup && data.language && data.mobileNumber && data.address && data.medicalNotes && data.developmentNotes)
          });
        });

        setChildren(childrenData);
        
        // If childFromUrl is specified, auto-select that child
        if (childFromUrl) {
          const childData = childrenData.find(child => child.name === childFromUrl);
          if (childData) {
            handleChildSelect(childData);
          }
        }

      } catch (err) {
        console.error('Error fetching children:', err);
      }
    };
    
    fetchChildren();
  }, [childFromUrl]);

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    setFormData({
      name: child.name || '',
      dob: child.dob || '',
      bloodGroup: child.bloodGroup || '',
      nickName: child.nickName || child.name || '',
      language: child.language || '',
      mobileNumber: child.mobileNumber || '',
      address: child.address || '',
      email: child.email || '',
      email2: child.email2 || '',
      medicalNotes: child.medicalNotes || '',
      allergies: child.allergies || '',
      medicationDetails: child.medicationDetails || '',
      medicationNeeds: child.medicationNeeds || '',
      dietaryRestrictions: child.dietaryRestrictions || '',
      developmentNotes: child.developmentNotes || '',
      pottyTrained: child.pottyTrained || '',
      sleepTrained: child.sleepTrained || '',
      eatsIndependently: child.eatsIndependently || '',
      attendedDaycare: child.attendedDaycare || '',
      previousDaycareDetails: child.previousDaycareDetails || '',
      likesAndDislikes: child.likesAndDislikes || '',
      enjoyedActivities: child.enjoyedActivities || '',
      triggersAndCalming: child.triggersAndCalming || '',
      behaviorWithOtherChildren: child.behaviorWithOtherChildren || '',
      learningStyleInfo: child.learningStyleInfo || '',
      dailyRoutine: child.dailyRoutine || '',
      sleepSchedule: child.sleepSchedule || '',
      mealSchedule: child.mealSchedule || '',
      mealPreferences: child.mealPreferences || '',
      culturalPractices: child.culturalPractices || '',
      communicationForFeelings: child.communicationForFeelings || '',
      additionalInfo: child.additionalInfo || '',
      expectations: child.expectations || ''
  });
  setIsConfirmed(false);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update child data in Firestore
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const childData = {
        name: formData.name,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        nickName: formData.nickName,
        language: formData.language,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        email: formData.email,
        email2: formData.email2,
        medicalNotes: formData.medicalNotes,
        allergies: formData.allergies,
        medicationDetails: formData.medicationDetails,
        medicationNeeds: formData.medicationNeeds,
        dietaryRestrictions: formData.dietaryRestrictions,
        developmentNotes: formData.developmentNotes,
        pottyTrained: formData.pottyTrained,
        sleepTrained: formData.sleepTrained,
        eatsIndependently: formData.eatsIndependently,
        attendedDaycare: formData.attendedDaycare,
        previousDaycareDetails: formData.previousDaycareDetails,
        likesAndDislikes: formData.likesAndDislikes,
        enjoyedActivities: formData.enjoyedActivities,
        triggersAndCalming: formData.triggersAndCalming,
        behaviorWithOtherChildren: formData.behaviorWithOtherChildren,
        learningStyleInfo: formData.learningStyleInfo,
        dailyRoutine: formData.dailyRoutine,
        sleepSchedule: formData.sleepSchedule,
        mealSchedule: formData.mealSchedule,
        mealPreferences: formData.mealPreferences,
        culturalPractices: formData.culturalPractices,
        communicationForFeelings: formData.communicationForFeelings,
        additionalInfo: formData.additionalInfo,
        expectations: formData.expectations,
        updatedAt: new Date().toISOString()
      };

        if (!isConfirmed) {
            alert('Please confirm that the information provided is accurate.');
            return;
        }

      if (selectedChild.id) {
        // Update existing child data
        const ref = doc(db, 'kidsInfo', selectedChild.id);
        await updateDoc(ref, childData);
        alert('Child data updated successfully!');
      } else {
        // This shouldn't happen in normal flow, but handle just in case
        await addDoc(collection(db, 'kidsInfo'), childData);
        alert('Child data created successfully!');
      }
      
      setSelectedChild(null);
      // Refresh the children list
      window.location.reload();
    } catch (err) {
      console.error('Error updating child data:', err);
      alert('Failed to save child data.');
    }
  };

  const YesNoButton = ({ name, value, onChange, label }) => {
  return (
    <>
      <label style={styles.yesNoLabel}>{label}</label>
      <div style={styles.yesNoContainer}>
        <button
          type="button"
          style={{
            ...styles.yesNoButton,
            ...(value === 'Yes' ? styles.yesButtonActive : styles.yesButton)
          }}
          onClick={() => onChange({ target: { name, value: 'Yes' } })}
        >
          Yes
        </button>
        <button
          type="button"
          style={{
            ...styles.yesNoButton,
            ...(value === 'No' ? styles.noButtonActive : styles.noButton)
          }}
          onClick={() => onChange({ target: { name, value: 'No' } })}
        >
          No
        </button>
      </div>
    </>
  );
};



  const styles = {
    container: {
      padding: '0',
      fontFamily: 'Inter, Arial, sans-serif',
      //background: '#f8f9fa',
      minHeight: '100vh',
      maxWidth: '100%'
    },
    header: {
      textAlign: 'center',
      marginBottom: '0px',
      color: '#333',
      fontSize: '18px',
      fontWeight: '600',
      padding: '16px 20px',
      backgroundColor: '#fff',
      //borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      position: 'relative'
    },
    backArrow: {
      fontSize: '18px',
      cursor: 'pointer',
      color: '#666',
      position: 'absolute',
      left: '20px'
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: '600',
      color: '#333'
    },
    gridContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      justifyContent: 'center',
      padding: '20px'
    },
    childBox: {
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
      position: 'relative',
      marginTop: '20px'
    },
    childStatus: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      fontSize: '12px',
      padding: '2px 6px',
      borderRadius: '10px',
      fontWeight: 'bold'
    },
    statusComplete: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    statusIncomplete: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    formContainer: {
      //backgroundColor: '#f8f9fa',
      padding: '20px',
      minHeight: '100vh'
    },
    sectionCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      marginBottom: '16px',
      overflow: 'hidden',
      //boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    sectionHeader: {
      padding: '16px 20px',
      backgroundColor: '#F6F5F5',
      border: '0.5px solid #565657',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      
    },
    sectionNumber: {
      width: '24px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: '#D3F26A',
      color: '#565657',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      marginRight: '12px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#565657',
      flex: 1
    },
    chevronIcon: {
      color: '#666',
      transition: 'transform 0.2s'
    },
    sectionContent: {
      padding: '0 20px 20px 20px',
      backgroundColor: '#fff'
    },
    label: {
      fontWeight: '600',
      marginBottom: '8px',
      marginTop: '16px',
      display: 'block',
      color: '#565657',
      fontSize: '16px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      marginBottom: '4px',
      borderRadius: '20px',
      border: '1px solid #e9ecef',
      fontSize: '16px',
      outline: 'none',
      backgroundColor: '#fff',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      marginBottom: '4px',
      borderRadius: '20px',
      border: '1px solid #e9ecef',
      fontSize: '16px',
      outline: 'none',
      backgroundColor: '#fff',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 12px center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '16px',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    dobContainer: {
      display: 'flex',
      gap: '12px'
    },
    dobField: {
      flex: 1
    },
    bloodGroupField: {
      flex: 1
    },
    dateInputContainer: {
      position: 'relative'
    },
    dateInput: {
      width: '100%',
      padding: '12px 16px',
      paddingRight: '40px',
      marginBottom: '4px',
      borderRadius: '20px',
      border: '1px solid #e9ecef',
      fontSize: '16px',
      outline: 'none',
      backgroundColor: '#fff',
      boxSizing: 'border-box'
    },
    calendarIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#666',
      pointerEvents: 'none'
    },
    submitButton: {
      width: '100%',
      background: '#D3F26A',
      color: '#565657',
      fontWeight: '600',
      fontSize: '16px',
      padding: '16px',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      margin: '20px 0'
    },
    
    yesNoContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px'
    },
    yesNoButton: {
        padding: '8px 24px',
        borderRadius: '20px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: '#666', // default gray
        color: '#fff'
    },
    yesButtonActive: {
        backgroundColor: '#D3F26A', // active = green
        color: '#565657'
    },
    noButtonActive: {
        backgroundColor: '#D3F26A', // active = green
        color: '#565657'
    },
    yesNoLabel: {
        fontWeight: '600',
        marginBottom: '8px',
        marginTop: '16px',
        display: 'block',
        color: '#565657',
        fontSize: '14px'
    },

    confirmationContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px'
    
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer',
    backgroundColor: '#D3F26A',
    
  },
  confirmationText: {
    fontSize: '14px',
    color: '#565657',
    lineHeight: '1.5',
    flex: 1
  }
  };

  return (
    <div style={styles.container}>
      {!selectedChild ? (
        <>
          {/* Header for Children List */}
          <div style={styles.header}>
            <span style={styles.backArrow} onClick={() => navigate('/')}>
              ←
            </span>
            <div style={styles.headerTitle}>Child Data</div>
          </div>
          
          {children.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>No children found.</p>
          ) : (
            <div style={styles.gridContainer}>
              {children.map((child, idx) => {
                const colors = ['#A0C4FF','#FFD6A5','#FFC6FF','#FDFFB6','#CAFFBF','#9BF6FF','#BDB2FF','#FFC6FF'];
                const hasCompleteData = child.hasCompleteData;
                
                return (
                  <div
                    key={`${child.name}-${idx}`}
                    style={{ ...styles.childBox, backgroundColor: colors[idx % colors.length] }}
                    onClick={() => handleChildSelect(child)}
                  >
                    <div 
                      style={{
                        ...styles.childStatus,
                        ...(hasCompleteData ? styles.statusComplete : styles.statusIncomplete)
                      }}
                    >
                      {hasCompleteData ? '✓' : '!'}
                    </div>
                    <strong>{child.name}</strong>
                    <div style={{ fontSize: '10px', marginTop: '5px' }}>
                      {hasCompleteData ? 'Data Complete' : 'Data Incomplete'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Header for Child Form */}
          <div style={styles.header}>
            <span style={styles.backArrow} onClick={() => setSelectedChild(null)}>
              ←
            </span>
            <div style={styles.headerTitle}>Child Data</div>
          </div>

          <form style={styles.formContainer} onSubmit={handleUpdate}>
            {/* Basic Information Section */}
            <div style={styles.sectionCard}>
              <div 
                style={styles.sectionHeader}
                onClick={() => toggleSection('basicInfo')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={styles.sectionNumber}>1</div>
                  <div style={styles.sectionTitle}>Basic Information</div>
                </div>
                {expandedSections.basicInfo ? 
                  <ChevronUp size={20} style={styles.chevronIcon} /> : 
                  <ChevronDown size={20} style={styles.chevronIcon} />
                }
              </div>
              
              {expandedSections.basicInfo && (
                <div style={styles.sectionContent}>
                  {/* Name */}
                  <label style={styles.label}>Name</label>
                  <input 
                    type="text"
                    name="name" 
                    style={styles.input} 
                    value={formData.name} 
                    onChange={handleChange}
                    disabled
                  />

                  {/* DOB and Blood Group */}
                  <div style={styles.dobContainer}>
                    <div style={styles.dobField}>
                      <label style={styles.label}>DOB</label>
                      <div style={styles.dateInputContainer}>
                        <input 
                          type="date"
                          name="dob" 
                          className="custom-placeholder"
                          style={styles.dateInput}
                          value={formData.dob} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div style={styles.bloodGroupField}>
                      <label style={styles.label}>Blood Group</label>
                      <select 
                        name="bloodGroup" 
                        className="custom-placeholder"
                        style={styles.select} 
                        value={formData.bloodGroup} 
                        onChange={handleChange}
                      >
                        <option value="O+ ve">O+ ve</option>
                        <option value="O- ve">O- ve</option>
                        <option value="A+ ve">A+ ve</option>
                        <option value="A- ve">A- ve</option>
                        <option value="B+ ve">B+ ve</option>
                        <option value="B- ve">B- ve</option>
                        <option value="AB+ ve">AB+ ve</option>
                        <option value="AB- ve">AB- ve</option>
                      </select>
                    </div>
                  </div>

                  {/* Nick Name */}
                  <label style={styles.label}>Any nick name or preferred name</label>
                  <>
                <style>
                    {`
                    .custom-placeholder::placeholder {
                        font-size: 10px; 
                        color: #98989A;
                    }
                    `}
                </style>
                  <input 
                    type="text"
                    name="nickName" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.nickName} 
                    onChange={handleChange}
                    placeholder="Enter nick name"
                  />
                </>

                  {/* Language */}
                  <label style={styles.label}>Language spoken at home</label>
                  <select 
                    name="language" 
                    style={styles.select} 
                    value={formData.language} 
                    onChange={handleChange}
                  >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
            </div>

            {/* Emergency Details Section */}
            <div style={styles.sectionCard}>
              <div 
                style={styles.sectionHeader}
                onClick={() => toggleSection('emergencyDetails')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={styles.sectionNumber}>2</div>
                  <div style={styles.sectionTitle}>Emergency Details</div>
                </div>
                {expandedSections.emergencyDetails ? 
                  <ChevronUp size={20} style={styles.chevronIcon} /> : 
                  <ChevronDown size={20} style={styles.chevronIcon} />
                }
              </div>
              
              {expandedSections.emergencyDetails && (
                <div style={styles.sectionContent}>
                  {/* Mobile Number */}
                  <label style={styles.label}>Mobile number of parents with relationship</label>
                  <>
                <style>
                    {`
                    .custom-placeholder::placeholder {
                        font-size: 13px; 
                        color: #98989A;
                    }
                    `}
                </style>

                  <input 
                    type="text"
                    name="mobileNumber" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.mobileNumber} 
                    onChange={handleChange}
                    placeholder="e.g., Father - 9876543210"
                  />
                </>
                <>
                <style>
                    {`
                    .custom-placeholder::placeholder {
                        font-size: 13px; 
                        color: #98989A;
                    }
                    `}
                </style>
                  {/* Address */}
                  <label style={styles.label}>Block & Flat No</label>
                  <input 
                    type="text"
                    name="address" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.address} 
                    onChange={handleChange}
                    placeholder="Enter block and flat number"
                  />
                </>

                  {/* Email 1 */}
                  <label style={styles.label}>Primary Email</label>
                <>
                <style>
                    {`
                    .custom-placeholder::placeholder {
                        font-size: 13px; 
                        color: #98989A;
                    }
                    `}
                </style>
                  <input 
                    type="email"
                    name="email" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="Enter primary email"
                  />
                  </>

                  {/* Email 2 */}
                  <label style={styles.label}>Secondary Email (Optional)</label>
                  <>
                <style>
                    {`
                    .custom-placeholder::placeholder {
                        font-size: 13px; 
                        color: #98989A;
                    }
                    `}
                </style>
                  <input 
                    type="email"
                    className="custom-placeholder"
                    name="email2" 
                    style={styles.input} 
                    value={formData.email2} 
                    onChange={handleChange}
                    placeholder="Enter secondary email"
                  />
                      </>
                </div>
              )}
            </div>

            {/* Medical Information Section */}
            <div style={styles.sectionCard}>
            <div 
                style={styles.sectionHeader}
                onClick={() => toggleSection('medicalInfo')}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.sectionNumber}>3</div>
                <div style={styles.sectionTitle}>Medical Information</div>
                </div>
                {expandedSections.medicalInfo ? 
                <ChevronUp size={20} style={styles.chevronIcon} /> : 
                <ChevronDown size={20} style={styles.chevronIcon} />
                }
            </div>
            
            {expandedSections.medicalInfo && (
                <div style={styles.sectionContent}>
                {/* Medical Information */}
                <label style={styles.label}>Medical Information</label>

                <textarea 
                    name="medicalNotes" 
                    className="custom-placeholder"
                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                    value={formData.medicalNotes} 
                    onChange={handleChange}
                    placeholder="Type any keywords"
                />
           

               
                {/* Allergies */}
                <label style={styles.label}>Does your child have any allergies</label>
               
             
                <input 
                    type="text"
                    name="allergies" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.allergies} 
                    onChange={handleChange}
                    placeholder="Type any known allergies"
                />
              
                {/* Medication Details */}
                <label style={styles.label}>Medication details of child</label>
          
                <input 
                    type="text"
                    name="medicationDetails" 
                     className="custom-placeholder"
                    style={styles.input} 
                    value={formData.medicationDetails} 
                    onChange={handleChange}
                    placeholder="Type the medication detail here"
                />
              

                {/* Medication Needs */}
                <label style={styles.label}>Medication needs, we must be aware of</label>
             
                <input 
                    type="text"
                    name="medicationNeeds" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.medicationNeeds} 
                    onChange={handleChange}
                    placeholder="Type the medication needs here"
                />
       

                {/* Dietary Restrictions */}
                <label style={styles.label}>Dietary restriction, we must be aware of</label>
              
             
                <input 
                    type="text"
                    name="dietaryRestrictions" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.dietaryRestrictions} 
                    onChange={handleChange}
                    placeholder="Type the dietary restriction here"
                />
             
                </div>
            )}
            </div>

            {/* Developmental Information Section */}
            <div style={styles.sectionCard}>
            <div 
                style={styles.sectionHeader}
                onClick={() => toggleSection('developmentalInfo')}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.sectionNumber}>4</div>
                <div style={styles.sectionTitle}>Developmental Information</div>
                </div>
                {expandedSections.developmentalInfo ? 
                <ChevronUp size={20} style={styles.chevronIcon} /> : 
                <ChevronDown size={20} style={styles.chevronIcon} />
                }
            </div>
            
            {expandedSections.developmentalInfo && (
                <div style={styles.sectionContent}>
                {/* Development Information */}
                <label style={styles.label}>Development Information</label>
                
                <textarea 
                    name="developmentNotes" 
                    className="custom-placeholder"
                    style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                    value={formData.developmentNotes} 
                    onChange={handleChange}
                    placeholder="Type any keywords"
                />
                

                {/* Potty Trained */}
                <YesNoButton 
                    name="pottyTrained"
                    value={formData.pottyTrained}
                    onChange={handleChange}
                    label="Child potty trained"
                />

                {/* Sleep Trained */}
                <YesNoButton 
                    name="sleepTrained"
                    value={formData.sleepTrained}
                    onChange={handleChange}
                    label="Child sleep trained"
                />

                {/* Eats Independently */}
                <YesNoButton 
                    name="eatsIndependently"
                    value={formData.eatsIndependently}
                    onChange={handleChange}
                    label="Child able to eat independently"
                />

                {/* Attended Daycare */}
                <YesNoButton 
                    name="attendedDaycare"
                    value={formData.attendedDaycare}
                    onChange={handleChange}
                    label="Child attended daycare before"
                />

                {/* Previous Daycare Details */}
                <label style={styles.label}>Previous daycare details</label>
                
                <input 
                    type="text"
                    name="previousDaycareDetails" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.previousDaycareDetails} 
                    onChange={handleChange}
                    placeholder="Type the name, duration of enrollment here"
                />
            

                {/* Likes and Dislikes */}
                <label style={styles.label}>Child have any specific like or dislike</label>
    
                <input 
                    type="text"
                    name="likesAndDislikes"
                     className="custom-placeholder" 
                    style={styles.input} 
                    value={formData.likesAndDislikes} 
                    onChange={handleChange}
                    placeholder="Type the like and dislike here"
                />
     

                {/* Activities */}
                <label style={styles.label}>Activities that the child enjoys doing?</label>
 
                <input 
                    type="text"
                    name="enjoyedActivities" 
                     className="custom-placeholder"
                    style={styles.input} 
                    value={formData.enjoyedActivities} 
                    onChange={handleChange}
                    placeholder="Type the activities here"
                />


                {/* Triggers and Calming */}
                <label style={styles.label}>Any triggers that usually lead to outbursts or meltdowns the child with calming strategy</label>
 
                <input 
                    type="text"
                    name="triggersAndCalming" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.triggersAndCalming} 
                    onChange={handleChange}
                    placeholder="Type the trigger and calming strategy here"
                />
    

                {/* Behavior with Other Children */}
                <label style={styles.label}>Child behaviour that affect other Children</label>
               
                <input 
                    type="text"
                    name="behaviorWithOtherChildren" 
                     className="custom-placeholder"
                    style={styles.input} 
                    value={formData.behaviorWithOtherChildren} 
                    onChange={handleChange}
                    placeholder="Type the behaviour like hitting, biting here"
                />
   

                {/* Learning Style */}
                <label style={styles.label}>Information regarding child development, learning style that you like us to know</label>

                <input 
                    type="text"
                    name="learningStyleInfo" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.learningStyleInfo} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />
    
                </div>
            )}
            </div>
            {/* Daily Routine Section */}
            <div style={styles.sectionCard}>
            <div 
                style={styles.sectionHeader}
                onClick={() => toggleSection('dailyRoutine')}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.sectionNumber}>5</div>
                <div style={styles.sectionTitle}>Daily Routine</div>
                </div>
                {expandedSections.dailyRoutine ? 
                <ChevronUp size={20} style={styles.chevronIcon} /> : 
                <ChevronDown size={20} style={styles.chevronIcon} />
                }
            </div>
            
            {expandedSections.dailyRoutine && (
                <div style={styles.sectionContent}>
                {/* Daily Routine */}
                <label style={styles.label}>Daily Routine of child</label>
              
                <input 
                    type="text"
                    name="dailyRoutine" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.dailyRoutine} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />
               

                {/* Sleep Schedule */}
                <label style={styles.label}>Child sleep schedule</label>
                <input 
                    type="text"
                    name="sleepSchedule" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.sleepSchedule} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />
                

                {/* Meal Schedule */}
                <label style={styles.label}>Child meal schedule and fav meal</label>
                
                <input 
                    type="text"
                    name="mealSchedule"
                    className="custom-placeholder" 
                    style={styles.input} 
                    value={formData.mealSchedule} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />
                

                {/* Meal Preferences */}
                <label style={styles.label}>Child meal or snacks preference</label>
                <input 
                    type="text"
                    name="mealPreferences" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.mealPreferences} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />
                

                {/* Cultural Practices */}
                <label style={styles.label}>Any Cultural or religious practice</label>
                <input 
                    type="text"
                    name="culturalPractices" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.culturalPractices} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />
                
                </div>
            )}
            </div>

            {/* Additional Information Section */}
            <div style={styles.sectionCard}>
            <div 
                style={styles.sectionHeader}
                onClick={() => toggleSection('additionalInfo')}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.sectionNumber}>6</div>
                <div style={styles.sectionTitle}>Additional Information</div>
                </div>
                {expandedSections.additionalInfo ? 
                <ChevronUp size={20} style={styles.chevronIcon} /> : 
                <ChevronDown size={20} style={styles.chevronIcon} />
                }
            </div>
            
            {expandedSections.additionalInfo && (
                <div style={styles.sectionContent}>
                {/* Communication for Feelings */}
                <label style={styles.label}>Child communication for feelings & needs</label>
                <input 
                    type="text"
                    name="communicationForFeelings" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.communicationForFeelings} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />

                {/* Additional Info */}
                <label style={styles.label}>Anything want to share with us</label>
                <input 
                    type="text"
                    name="additionalInfo" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.additionalInfo} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />

                {/* Expectations */}
                <label style={styles.label}>Your expectation from mimansa kids</label>
                <input 
                    type="text"
                    name="expectations" 
                    className="custom-placeholder"
                    style={styles.input} 
                    value={formData.expectations} 
                    onChange={handleChange}
                    placeholder="Type the keyword here"
                />
                </div>
            )}
            </div>

            {/* Confirmation Section */}
            <div style={styles.confirmationContainer}>
            <div style={styles.checkboxContainer}>
                <input 
                type="checkbox"
                id="confirmation"
                style={styles.checkbox}
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <label htmlFor="confirmation" style={styles.confirmationText}>
                I confirm that the information provided is accurate and I agree to the best of my knowledge. I also consent to the daycare using this information to design a care and learning plan for my child.
                </label>
            </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              Submit
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChildData;
