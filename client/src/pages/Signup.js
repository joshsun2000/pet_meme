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
      const res = await API.post('/auth/signup', { username, password });
      localStorage.setItem('token', res.data.token);
      alert('Signup successful!');
      navigate('/account');
    } catch (err) {
      console.error(err);
      alert('Signup failed.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Signup</h1>
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="Username"
            value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="mb-3">
          <input type="password" className="form-control" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <input type="password" className="form-control" placeholder="Confirm Password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
