import React, { useState, useCallback ,useEffect,useRef} from 'react';
import html2canvas from 'html2canvas-pro';
import { RiScreenshot2Line, RiShareLine, RiDownloadLine } from "react-icons/ri";
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ScreenshotButton = ({ content, channel }) => {
  const [screenshotCount, setScreenshotCount] = useState(content.screenshotCount);
  const [screenshot, setScreenshot] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [logoImage, setLogoImage] = useState(null);
  const dropdownRef = useRef(null);
  const { theme } = useTheme(); // Get current theme

  useEffect(() => {
    const img = new Image();
    img.src = '/TruePace.svg';
    img.onload = () => setLogoImage(img);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const captureContent = useCallback(async () => {
    try {
      const contentElement = document.getElementById(`content-${content._id}`);
      if (!contentElement) {
        console.error('Content element not found');
        return;
      }

      
      // Clone the element to modify it for screenshot
      const clonedElement = contentElement.cloneNode(true);
      

        // Apply theme-specific styles to the cloned element
        if (theme === 'dark') {
          clonedElement.style.backgroundColor = 'rgb(17 24 39)'; // dark mode background
          clonedElement.style.color = 'rgb(229 231 235)'; // dark mode text
          // Ensure all text elements are visible in dark mode
          const textElements = clonedElement.querySelectorAll('*');
          textElements.forEach(el => {
            if (window.getComputedStyle(el).color === 'rgb(0, 0, 0)') {
              el.style.color = 'rgb(229 231 235)';
            }
          });
        } else {
          clonedElement.style.backgroundColor = '#fef2f2'; // light mode background
          clonedElement.style.color = 'black'; // light mode text
        }
  

      const canvas = await html2canvas(contentElement, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
        logging: true,
      backgroundColor: theme === 'dark' ? 'rgb(17 24 39)' : '#fef2f2'
      });

      // Add watermarks
      const ctx = canvas.getContext('2d');
      ctx.font = 'bold 9px Arial';
      
    
      // Function to draw text with outline - adjusted for dark mode
      const drawTextWithOutline = (text, x, y) => {
        if (theme === 'dark') {
          // Dark mode text style
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeText(text, x, y);
          ctx.fillStyle = 'rgba(229, 231, 235, 0.9)'; // Light gray for dark mode
        } else {
          // Light mode text style
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeText(text, x, y);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        }
        ctx.fillText(text, x, y);
      };

      
      // // Draw logo
      // if (logoImage) {
      //   const logoSize = 9; // Adjust size as needed
      //   ctx.drawImage(logoImage, 20, 445, logoSize, logoSize);
      //   drawTextWithOutline(`TruePace.com`, 30, 455); // Adjust position to be next to the logo
      // } else {
      //   drawTextWithOutline(`TruePace.com`, 15, 455);
      // }
      
      // drawTextWithOutline(`@${channel.name}`, 20, 470);
      // drawTextWithOutline(`${new Date(content.createdAt).toLocaleString()}`, 245, 470);
      

      // Get screen width once
const screenWidth = window.innerWidth;

// Draw logo
if (logoImage) {
  // Adjust logo size based on screen width
  const logoSize = screenWidth > 1024 ? 12 : // desktop
                  screenWidth > 640 ? 10 : // tablet
                  9; // mobile (original size)
                  
  // Position logo
  const logoX = screenWidth > 1024 ? 410 : // desktop
                screenWidth > 640 ? 30 : // tablet (i haven't done the tab position as of 3/11/2024)
                20; // mobile (original position)
                
  const logoY = screenWidth > 1024 ? 465 : // desktop
                screenWidth > 640 ? 455 : // tablet 
                445; // mobile (original position)

  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
  
  // Position TruePace.com text next to logo
  const textX = screenWidth > 1024 ? 426 : // desktop
                screenWidth > 640 ? 45 : // tablet (i haven't done the tab position as of 3/11/2024)
                30; // mobile (original position)
                
  const textY = screenWidth > 1024 ? 478 : // desktop
                screenWidth > 640 ? 465 : // tablet(i haven't done the tab position as of 3/11/2024)
                455; // mobile (original position)

  drawTextWithOutline(`TruePace.com`, textX, textY);
} else {
  // If no logo, just draw text
  const textX = screenWidth > 1024 ? 426 : // desktop
                screenWidth > 640 ? 30 : // tablet (i haven't done the tab position as of 3/11/2024)
                15; // mobile (original position)
                
  const textY = screenWidth > 1024 ? 478 : // desktop
                screenWidth > 640 ? 465 : // tablet (i haven't done the tab position as of 3/11/2024)
                455; // mobile (original position)

  drawTextWithOutline(`TruePace.com`, textX, textY);
}

// Position channel name and date
const channelX = screenWidth > 1024 ? 410 : // desktop 
                screenWidth > 640 ? 30 : // tablet (i haven't done the tab position as of 3/11/2024)
                20; // mobile (original position)
                
const dateX = screenWidth > 1024 ? 1100 : // desktop
             screenWidth > 640 ? 305 : // tablet (i haven't done the tab position as of 3/11/2024)
             245; // mobile (original position)
             
const bottomY = screenWidth > 1024 ? 490 : // desktop
               screenWidth > 640 ? 480 : // tablet
               470; // mobile (original position)

drawTextWithOutline(`@${channel.name}`, channelX, bottomY);
drawTextWithOutline(`${new Date(content.createdAt).toLocaleString()}`, dateX, bottomY);

      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      setScreenshot(blob);

      // Update screenshot count
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: content._id, action: 'screenshot' }),
      });
      if (response.ok) {
        const data = await response.json();
        setScreenshotCount(data.screenshotCount);
      } else {
        console.error('Error updating screenshot count:', await response.text());
      }
    } catch (error) {
      console.error('Error capturing content:', error);
      alert('Sorry, we encountered an error while capturing the content. Please try again later.');
    }
  }, [content._id, content.createdAt, channel.name, logoImage]);


  const shareContent = async () => {
    if (!screenshot) {
      await captureContent();
    }
    
    if (screenshot) {
      const shareData = {
        files: [new File([screenshot], 'truepace_content.png', { type: 'image/png' })],
        title: 'TruePace Content',
        text: 'Check out this content from TruePace!',
      };

      if (navigator.share && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.error('Error sharing content:', error);
        }
      } else {
        alert('Web Share API is not supported on this browser. Please use the download option.');
      }
    }
  };

  const downloadContent = async () => {
    if (!screenshot) {
      await captureContent();
    }

    if (screenshot) {
      const url = URL.createObjectURL(screenshot);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'truepace_content.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleScreenshotClick = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className="flex flex-col items-center relative" ref={dropdownRef}>
    <button onClick={handleScreenshotClick} className="flex flex-col items-center mb-2 h-11">
      <RiScreenshot2Line size='1.6em' className="m-auto" />
      <p className="text-xs">({screenshotCount})</p>
    </button>
    {showOptions && (
      <div className="absolute bottom-full mb-2 bg-white shadow-md rounded-md p-2 dark:text-gray-200 dark:bg-gray-700 ">
        <button onClick={shareContent} className="flex items-center mb-2  w-full dark:hover:bg-gray-600">
          <RiShareLine size='1.5em' />
          <span className="ml-1 text-xs ">Share</span>
        </button>
        <button onClick={downloadContent} className="flex items-center dark:hover:bg-gray-600 w-full">
          <RiDownloadLine size='1.5em' />
          <span className="ml-1 text-xs">Download</span>
        </button>
      </div>
    )}
  </div>
);
};

export default ScreenshotButton;