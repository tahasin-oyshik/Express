import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/profile`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => navigate('/profile'))
      .catch((error) => {
        navigate('/login');
      });
  }, []);

  const handleLogin = () => {
    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/login`, { username, password })
      .then((user) => {
        localStorage.setItem('token', user.data.token);
        console.log('user is logged in');
        navigate('/profile');
      })
      .catch((error) => {
        console.log(error);
        navigate('/login');
      });
  };

  return (
    <div>
      <h2>Login page</h2>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        required
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        required
      />
      <button type="submit" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
