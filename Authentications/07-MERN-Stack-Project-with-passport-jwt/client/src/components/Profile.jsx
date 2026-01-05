import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/profile`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => console.log(response))
      .catch((error) => {
        navigate('/login');
      });
  }, []);

  return (
    <div>
      <h2>Profile page</h2>
    </div>
  );
};

export default Profile;
