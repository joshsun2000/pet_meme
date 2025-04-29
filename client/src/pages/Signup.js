import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      const res = await API.post('/api/auth/signup', { username, password });
      localStorage.setItem('token', res.data.token);
      alert('Signup successful!');
      navigate('/account');
    } catch (err) {
      console.error(err);
      alert('Signup failed.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="card p-4 shadow rounded-4" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff' }}>
            <h2 className="text-center mb-4" style={{ fontFamily: 'Oxygen, sans-serif', color: '#6D8B74' }}>Sign Up</h2>

            {/* Email Input */}
            <input
                type="text"
                className="form-control rounded-pill mb-3"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ fontFamily: 'Oxygen, sans-serif', padding: '10px 20px' }}
            />

            {/* Password Input */}
            <input
                type="password"
                className="form-control rounded-pill mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontFamily: 'Oxygen, sans-serif', padding: '10px 20px' }}
            />

            {/* Confirm Password Input */}
            <input
                type="password"
                className="form-control rounded-pill mb-4"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ fontFamily: 'Oxygen, sans-serif', padding: '10px 20px' }}
            />

            {/* Signup Button */}
            <button
                className="btn btn-custom w-100 rounded-pill"
                onClick={handleSignup}
            >
                Sign Up
            </button>

            {/* Login Link */}
            <div className="text-center mt-3" style={{ fontFamily: 'Oxygen, sans-serif', fontSize: '0.9rem' }}>
                Already have an account? <a href="/login" style={{ color: '#A47164', textDecoration: 'none' }}>Login</a>
            </div>
        </div>
    </div>
);
};

export default Signup;
