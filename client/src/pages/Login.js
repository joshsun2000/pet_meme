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
    <div className="container mt-5">
      <h1 className="text-center mb-4">Login</h1>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="Username"
            value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="mb-3">
          <input type="password" className="form-control" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
};

export default Login;
