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

  const totalDuration = 24 * 60 * 60; // 24 hours in seconds
  const percentage = (timeLeft / totalDuration) * 100;

  return (
    <div className="relative w-11 h-11">
      <svg className="w-full h-full" viewBox="0 0 40 40">
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="2"
          cx="20"
          cy="20"
          r="18"
          fill="transparent"
        ></circle>
        <circle
          className="text-red-800 progress-ring__circle stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          cx="20"
          cy="20"
          r="18"
          fill="transparent"
          strokeDasharray={`${2 * Math.PI * 18}`}
          strokeDashoffset={`${((100 - percentage) / 100) * (2 * Math.PI * 18)}`}
          transform="rotate(-90 20 20)"
        ></circle>
      </svg>
      {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] text-center dark:text-gray-200">
        <div>{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
      </div>
    </div> */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-black bg-opacity-50 rounded px-1 py-0.5">
          <div className="text-[8px] font-bold text-white drop-shadow">
            {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;