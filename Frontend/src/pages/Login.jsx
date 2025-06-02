import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import bgImage from '../assets/loginbg.png';
import giraffeIcon from '../assets/Logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      padding: '16px' // Mobile padding
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(10px)',
        padding: '32px 24px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        color: '#333',
        boxSizing: 'border-box'
      }}>
        <img src={giraffeIcon} alt="giraffe" style={{ width: '60px', marginBottom: '12px' }} />
        <h2 style={{ margin: '0 0 24px', fontWeight: 'bold' }}>Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <div style={{ color: '#e06666', marginTop: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#fff' }}>
          <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>
            Forget Password?
          </a>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  margin: '8px 0',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  background: '#fff',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  marginTop: '16px',
  borderRadius: '8px',
  border: 'none',
  background: '#c7a6f8',
  color: '#fff',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background 0.2s ease-in-out'
};
