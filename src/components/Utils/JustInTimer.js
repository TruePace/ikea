import React, { useState, useEffect } from 'react';

const JustInTimer = ({ expirationTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expirationTime) - new Date();
      return Math.max(0, Math.floor(difference / 1000));
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expirationTime]);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const percentage = (timeLeft / (15 * 60)) * 100;
  
  return (
    <div className="relative w-11 h-11">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="2"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
        />
        <circle
          className="text-red-800 progress-ring__circle stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${((100 - percentage) / 100) * (2 * Math.PI * 40)}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Text container with background for contrast */}
        <div className="bg-black bg-opacity-40 rounded-full p-1 flex items-center justify-center">
          <span className="text-[8px] font-bold text-white drop-shadow-sm">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JustInTimer;