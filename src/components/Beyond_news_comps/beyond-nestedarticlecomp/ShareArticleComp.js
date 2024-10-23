import React, { useState, useEffect, useRef } from 'react';
import { FaShare, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaCopy } from 'react-icons/fa';
import { useAuth } from '@/app/(auth)/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ShareArticleComp = ({ article }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareCount, setShareCount] = useState(article.shareCount || 0);
  const { firebaseUser } = useAuth();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async (platform) => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        
        let location = null;
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        }

        const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${article._id}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ platform, location })
        });

        if (response.ok) {
          const data = await response.json();
          setShareCount(data.shareCount);
        }
      } catch (error) {
        console.error('Error sharing article:', error);
      }
    }

    const shareUrl = `${window.location.origin}//beyond_news/nestedarticle/${article._id}`;
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`, '_blank');
        break;
      case 'instagram':
        alert('Instagram sharing is not directly supported. You can copy the link and share it manually.');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }

    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaShare className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
        ({shareCount})
      </button>

      {isOpen && (
        <div
        ref={dropdownRef}
        className="absolute left-0 xss:left-full xs:left-full sm:left-full md:left-full ml-2 w-48 xss:w-48 xs:w-56 sm:w-56 md:w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
      >
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          <button 
            onClick={() => handleShare('facebook')} 
            className="w-full flex items-center px-3 py-2 text-xs xss:text-sm xs:text-sm sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" 
            role="menuitem"
          >
            <FaFacebook className="mr-2 h-4 w-4 xss:h-5 xss:w-5 text-blue-600" />
            Facebook
          </button>
          <button 
            onClick={() => handleShare('twitter')} 
            className="w-full flex items-center px-3 py-2 text-xs xss:text-sm xs:text-sm sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" 
            role="menuitem"
          >
            <FaTwitter className="mr-2 h-4 w-4 xss:h-5 xss:w-5 text-blue-400" />
            Twitter
          </button>
          <button 
            onClick={() => handleShare('whatsapp')} 
            className="w-full flex items-center px-3 py-2 text-xs xss:text-sm xs:text-sm sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" 
            role="menuitem"
          >
            <FaWhatsapp className="mr-2 h-4 w-4 xss:h-5 xss:w-5 text-green-500" />
            WhatsApp
          </button>
          <button 
            onClick={() => handleShare('instagram')} 
            className="w-full flex items-center px-3 py-2 text-xs xss:text-sm xs:text-sm sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" 
            role="menuitem"
          >
            <FaInstagram className="mr-2 h-4 w-4 xss:h-5 xss:w-5 text-pink-500" />
            Instagram
          </button>
          <button 
            onClick={() => handleShare('copy')} 
            className="w-full flex items-center px-3 py-2 text-xs xss:text-sm xs:text-sm sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" 
            role="menuitem"
          >
            <FaCopy className="mr-2 h-4 w-4 xss:h-5 xss:w-5 text-gray-500" />
            Copy Link
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default ShareArticleComp;