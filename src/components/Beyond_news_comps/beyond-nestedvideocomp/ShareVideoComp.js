import React, { useState } from 'react';
import { FaShare } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaCopy } from 'react-icons/fa';
import { useAuth } from '@/app/(auth)/AuthContext';

const ShareVideoComp
 = ({ video, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { firebaseUser } = useAuth();

  const handleShare = async (platform) => {
    if (!firebaseUser) {
      // Redirect to login or show login prompt
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
        // Instagram doesn't have a direct share URL, so we'll just copy the link
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

    // Call the onShare function to record the interaction
    onShare(platform);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-1">
        <FaShare />
        <span>Share</span>
        <span>{video.shareCount || 0}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-2">
          <button onClick={() => handleShare('facebook')} className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full">
            <FaFacebook className="text-blue-600" />
            <span>Facebook</span>
          </button>
          <button onClick={() => handleShare('twitter')} className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full">
            <FaTwitter className="text-blue-400" />
            <span>Twitter</span>
          </button>
          <button onClick={() => handleShare('whatsapp')} className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full">
            <FaWhatsapp className="text-green-500" />
            <span>WhatsApp</span>
          </button>
          <button onClick={() => handleShare('instagram')} className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full">
            <FaInstagram className="text-pink-600" />
            <span>Instagram</span>
          </button>
          <button onClick={() => handleShare('copy')} className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full">
            <FaCopy />
            <span>Copy Link</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareVideoComp
;