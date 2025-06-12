// src/components/FloatingWriteButton.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import './FloatingWriteButton.css';
import { FaPen } from 'react-icons/fa';

const FloatingWriteButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname.startsWith("/treasure")) {
      navigate("/treasure/write");
    } else {
      navigate("/post");
    }
  };

  return (
    <button onClick={handleClick} className="floating-write-button">
      <FaPen className="button-icon"/>
    </button>
  );
};

export default FloatingWriteButton;