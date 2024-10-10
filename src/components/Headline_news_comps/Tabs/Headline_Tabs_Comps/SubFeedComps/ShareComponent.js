import React, { useState, useRef, useEffect } from 'react';
import { FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';

const ShareComponent = ({ contentId, onShare, shareCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  const shareUrl = `${window.location.origin}/headline_news/${contentId}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShare = (platform) => {
    let url;
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`;
        break;
      case 'instagram':
        alert('Instagram sharing is not directly supported. You can copy the link and share it manually.');
        return;
      default:
        url = shareUrl;
    }

    window.open(url, '_blank');
    onShare(platform);
    setIsOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare('copy');
      setIsOpen(false);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button onClick={() => handleShare('facebook')} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
              <FaFacebook className="mr-2" /> Facebook
            </button>
            <button onClick={() => handleShare('twitter')} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
              <FaTwitter className="mr-2" /> Twitter
            </button>
            <button onClick={() => handleShare('whatsapp')} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
              <FaWhatsapp className="mr-2" /> WhatsApp
            </button>
            <button onClick={() => handleShare('instagram')} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
              <FaInstagram className="mr-2" /> Instagram
            </button>
            <button onClick={copyToClipboard} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
              <MdContentCopy className="mr-2" /> Copy Link
            </button>
          </div>
        </div>
      )}
      <button 
  onClick={() => setIsOpen(!isOpen)} 
  className="flex flex-col items-center text-gray-500 hover:text-gray-700"
>
  <FaShareAlt />
  <p>({shareCount})</p>
</button>
      
      {copied && <span className="absolute top-full left-0 mt-2 text-green-500">Copied!</span>}
    </div>
  );
};

export default ShareComponent;