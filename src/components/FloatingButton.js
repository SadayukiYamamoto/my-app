// src/components/FloatingButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingButton.css';
import { FaPen } from 'react-icons/fa';

const FloatingButton = ({ scrollDirection }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/post');
  };

  return (
    <button
      className={`floating-button ${scrollDirection === "down" ? "floating-button-hidden" : ""}`}
      onClick={handleClick}
    >
      <FaPen className="button-icon" />
    </button>
  );
};

export default FloatingButton;


