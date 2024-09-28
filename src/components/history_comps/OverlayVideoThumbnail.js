import React from 'react';
import Image from "next/image";
import { FaPlay } from "react-icons/fa";

const OverlayVideoThumbnail = ({ src, alt, width, height }) => {
  return (
    <div className="relative group">
      <Image 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        className="rounded-md object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300">
        <div className="bg-black bg-opacity-50 rounded-full p-4">
          <FaPlay className="text-white text-3xl" />
        </div>
      </div>
    </div>
  );
};

export default OverlayVideoThumbnail;