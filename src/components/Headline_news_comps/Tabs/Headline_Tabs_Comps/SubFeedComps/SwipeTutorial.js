import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowLeft, FaArrowRight, FaHandPaper, FaArrowDown } from 'react-icons/fa';

const SwipeTutorial = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Slower auto-advance through tutorial steps (8 seconds per step)
    const timer = setInterval(() => {
      if (step < 3) {  // Updated to include new channel navigation step
        setStep(prev => prev + 1);
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setShow(false);
          onComplete?.();
        }, 2000);
      }
    }, 8000);  // Increased from 4000 to 8000ms

    return () => clearInterval(timer);
  }, [step, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Tutorial Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {step === 0 && (
            <div className="text-center text-white space-y-8 animate-fade-in">
              <div className="flex flex-col items-center gap-4">
                <FaArrowUp className="w-16 h-16 animate-bounce" />
                <p className="text-xl font-semibold">Swipe Up</p>
                <p className="text-sm max-w-xs">
                  Swipe up to see more content from the same channel
                </p>
              </div>
              <FaHandPaper className="w-12 h-12 text-white animate-slide-up" />
            </div>
          )}

          {step === 1 && (
            <div className="text-center text-white space-y-8 animate-fade-in">
              <div className="flex items-center gap-8">
                <FaArrowLeft className="w-16 h-16 animate-pulse" />
                <FaArrowRight className="w-16 h-16 animate-pulse" />
              </div>
              <p className="text-xl font-semibold">Swipe Left or Right</p>
              <p className="text-sm max-w-xs">
                Swipe horizontally to switch between Headline News and Just In tabs
              </p>
              <FaHandPaper className="w-12 h-12 text-white animate-slide-horizontal" />
            </div>
          )}

          {step === 2 && (
            <div className="text-center text-white space-y-8 animate-fade-in">
              <div className="flex items-center gap-8">
                <FaArrowDown className="w-16 h-16 animate-pulse" />
                <FaArrowUp className="w-16 h-16 animate-pulse" />
              </div>
              <p className="text-xl font-semibold">Navigate Channels</p>
              <p className="text-sm max-w-xs">
                From any tab, swipe up or down to move between different channels
              </p>
              <FaHandPaper className="w-12 h-12 text-white animate-slide-vertical" />
            </div>
          )}

              {step === 3 && (
                <div className="text-center text-white space-y-4 animate-fade-in">
                  <p className="text-2xl font-bold">You&apos;re Ready!</p>
                  <p className="text-sm max-w-xs">
                    Start exploring channels and their latest updates
                  </p>
                </div>
              )}
        </div>

        {/* Progress Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[0, 1, 2, 3].map((dotStep) => (
            <div
              key={dotStep}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === dotStep ? 'bg-white w-4' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Skip Button */}
        <button
          onClick={() => {
            setShow(false);
            onComplete?.();
          }}
          className="absolute top-8 right-8 text-white text-sm underline"
        >
          Skip Tutorial
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-up {
          0% { transform: translateY(20px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(20px); }
        }

        @keyframes slide-horizontal {
          0% { transform: translateX(-20px); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(-20px); }
        }

        @keyframes slide-vertical {
          0% { transform: translateY(-20px); }
          50% { transform: translateY(20px); }
          100% { transform: translateY(-20px); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide-up {
          animation: slide-up 2s infinite;
        }

        .animate-slide-horizontal {
          animation: slide-horizontal 2s infinite;
        }

        .animate-slide-vertical {
          animation: slide-vertical 2s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in;
        }
      `}</style>
    </div>
  );
};

export default SwipeTutorial;