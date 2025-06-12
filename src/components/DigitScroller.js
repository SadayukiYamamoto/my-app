// src/components/DigitScroller.js
import React, { useEffect, useState } from "react";
import "./DigitScroller.css";

const DigitScroller = ({ digit }) => {
  const [currentDigit, setCurrentDigit] = useState(0);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setCurrentDigit(digit);
    }, 50);
    return () => clearTimeout(timeout);
  }, [digit]);

  const digitList = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="digit-container">
      <div
        className="digit-scroll"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {digitList.map((num) => (
          <div className="digit" key={num}>
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitScroller;
