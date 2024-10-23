import React, { useState, useEffect, useRef } from 'react';
import { FaShare, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaCopy } from 'react-icons/fa';
import { useAuth } from '@/app/(auth)/AuthContext';

const ShareVideoComp = ({ video, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { firebaseUser } = useAuth();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async (platform) => {
    if (!firebaseUser) {
      return;
    }

    let url;
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(video.title)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(video.title + ' ' + window.location.href)}`;
        break;
      case 'instagram':
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied! You can now paste it on Instagram.');
        break;
      case 'copy':
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }

    onShare(platform);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-md"
      >
        <FaShare className="text-gray-600" />
        <span>Share</span>
        <span>({video.shareCount || 0})</span>
      </button>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-md p-2 w-48 border border-gray-200"
        >
          <button 
            onClick={() => handleShare('facebook')} 
            className="flex items-center justify-center w-full p-3 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaFacebook className="text-blue-600 mr-2" />
            <span>Facebook</span>
          </button>
          <button 
            onClick={() => handleShare('twitter')} 
            className="flex items-center justify-center w-full p-3 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaTwitter className="text-blue-400 mr-2" />
            <span>Twitter</span>
          </button>
          <button 
            onClick={() => handleShare('whatsapp')} 
            className="flex items-center justify-center w-full p-3 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaWhatsapp className="text-green-500 mr-2" />
            <span>WhatsApp</span>
          </button>
          <button 
            onClick={() => handleShare('instagram')} 
            className="flex items-center justify-center w-full p-3 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaInstagram className="text-pink-600 mr-2" />
            <span>Instagram</span>
          </button>
          <button 
            onClick={() => handleShare('copy')} 
            className="flex items-center justify-center w-full p-3 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaCopy className="text-gray-600 mr-2" />
            <span>Copy Link</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareVideoComp;