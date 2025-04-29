import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      alert('Login successful!');
      navigate('/account');
    } catch (err) {
      console.error(err);
      alert('Login failed.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="card p-4 shadow rounded-4" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff' }}>
            <h2 className="text-center mb-4" style={{ fontFamily: 'Oxygen, sans-serif', color: '#6D8B74' }}>Login</h2>

            {/* Username Input */}
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
                className="form-control rounded-pill mb-4"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontFamily: 'Oxygen, sans-serif', padding: '10px 20px' }}
            />

            {/* Login Button */}
            <button
                className="btn btn-custom w-100 rounded-pill"
                onClick={handleLogin}
            >
                Login
            </button>

            {/* Signup Link */}
            <div className="text-center mt-3" style={{ fontFamily: 'Oxygen, sans-serif', fontSize: '0.9rem' }}>
                Don't have an account? <a href="/signup" style={{ color: '#A47164', textDecoration: 'none' }}>Sign up</a>
            </div>
        </div>
    </div>
);

};

export default Login;
