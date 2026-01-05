import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
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
        navigate('/register');
      });
  }, []);

  const handleRegister = () => {
    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/register`, { username, password })
      .then(() => {
        console.log('user is registered');
        navigate('/login');
      })
      .catch((error) => {
        console.log(error);
        navigate('/register');
      });
  };

  return (
    <div>
      <h2>Register page</h2>
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
      <button type="submit" onClick={handleRegister}>
        Register
      </button>
    </div>
  );
};

export default Register;
