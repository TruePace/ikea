import React from 'react';
import Image from "next/image";
import { FaPlay } from "react-icons/fa";

const OverlayVideoThumbnail = ({ src, alt }) => {
  return (
    <div className="relative w-full h-full group">
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        className="rounded-md"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300">
        <div className="bg-black bg-opacity-50 rounded-full p-3 tablet:p-3 desktop:p-4">
          <FaPlay className="text-white text-2xl tablet:text-2xl desktop:text-3xl" />
        </div>
      </div>
    </div>
  );
};

export default OverlayVideoThumbnail;