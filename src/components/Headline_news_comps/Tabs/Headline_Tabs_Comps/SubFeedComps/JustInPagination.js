import React, { useState, useEffect } from 'react';
import { FaArrowRight,FaArrowLeft } from 'react-icons/fa';

const JustInPagination = ({ 
  currentIndex, 
  totalPages, 
  onPageChange,
  containerRef 
}) => {
  const [displayPages, setDisplayPages] = useState([]);

  useEffect(() => {
    const calculateDisplayPages = () => {
      const range = [];
      const delta = 2;
      for (
        let i = Math.max(0, currentIndex - delta);
        i < Math.min(totalPages, currentIndex + delta + 1);
        i++
      ) {
        range.push(i);
      }
      setDisplayPages(range);
    };
    calculateDisplayPages();
  }, [currentIndex, totalPages]);

  const handlePageClick = (index) => {
    onPageChange(index);
    if (containerRef.current) {
      const slideWidth = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center items-center gap-2">
      <button 
        onClick={() => handlePageClick(Math.max(0, currentIndex - 1))}
        disabled={currentIndex === 0}
        className="p-1 rounded-full bg-white/80 backdrop-blur-sm shadow-md disabled:opacity-50"
      >
        <FaArrowLeft className="w-5 h-5" />
      </button>
      
      <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
        {displayPages.map(pageIndex => (
          <button
            key={pageIndex}
            onClick={() => handlePageClick(pageIndex)}
            className={`w-6 h-6 rounded-full text-sm flex items-center justify-center 
              ${currentIndex === pageIndex 
                ? 'bg-red-600 text-white' 
                : 'bg-transparent hover:bg-red-100'
              }`}
          >
            {pageIndex + 1}
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => handlePageClick(Math.min(totalPages - 1, currentIndex + 1))}
        disabled={currentIndex === totalPages - 1}
        className="p-1 rounded-full bg-white/80 backdrop-blur-sm shadow-md disabled:opacity-50"
      >
        <FaArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default JustInPagination;