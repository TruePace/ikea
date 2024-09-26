import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expirationTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(expirationTime) - new Date();
    return Math.max(0, Math.floor(difference / 1000));
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expirationTime]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const percentage = (timeLeft / (24 * 60 * 60)) * 100;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="8"
          cx="60"
          cy="60"
          r="54"
          fill="transparent"
        ></circle>
        <circle
          className="text-blue-600 progress-ring__circle stroke-current"
          strokeWidth="8"
          strokeLinecap="round"
          cx="60"
          cy="60"
          r="54"
          fill="transparent"
          strokeDasharray={`${2 * Math.PI * 54}`}
          strokeDashoffset={`${((100 - percentage) / 100) * (2 * Math.PI * 54)}`}
        ></circle>
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-center">
        <div>{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
      </div>
    </div>
  );
};

export default CountdownTimer;