import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import Link from 'next/link';

const SearchBar = ({ onClose, channels }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [filteredChannels, setFilteredChannels] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChannels(filtered);
    } else {
      setFilteredChannels([]);
    }
  }, [searchQuery, channels]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full dark:text-gray-200 dark:bg-gray-900 bg-white z-50 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 flex items-center">
        <button onClick={handleClose} className="mr-4">
          <FaArrowLeft size="1.6em"/>
        </button>
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 border border-gray-300 dark:bg-gray-900 rounded pr-10"
          />
          {searchQuery && (
            <button type="button" onClick={handleClear} className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <FaTimes size="1.2em" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {filteredChannels.map(channel => (
           <Link 
           key={channel._id} 
           href={`/truepacer_profile/${channel._id}`}
           className="block p-2 hover:bg-gray-100"
         >
           {channel.name}
         </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;