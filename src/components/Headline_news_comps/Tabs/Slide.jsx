'use client';


import { useState, useEffect, useRef } from 'react';

let items = [
  { title: 'Headline News', label: 'Headline News',hcontent:(
    <>
      {/* <h1 className='text-3xl text-blue-600'>hello Dear</h1> */}
      <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis
         quo ratione explicabo quidem porro commodi voluptatum dicta enim iste? Illum dolore dolorum et eligendi 
         laboriosam alias officia, tenetur quod itaque.</p>
     
    </>
  ) },
  { title: 'Just In', label: 'Just In' ,content:(
    <>
    <div className='border-2 border-blue-400 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll  whitespace-nowrap snap-x snap-mandatory w-full'>
      <div className='inline-block w-full bg-green-400 h-96  snap-start'>
     
         </div>
         <div  className='inline-block  w-full bg-red-400 h-96 snap-start'>
     
         </div>
         <div  className='inline-block  w-full bg-yellow-300 h-96 snap-start'>
     
         </div>
    </div>
    </>
  )}
];

const Slide = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const contentRef = useRef(null);
  const swipeStartX = useRef(null);
  const swipeDirection = useRef(null); // Track swipe direction (left/right)

  const handleTouchStart = (event) => {
  swipeStartX.current = event.touches[0].clientX;
  const MIN_SWIPE_DISTANCE = 50; // Minimum swipe distance for tab change

  // Check for single touch (click) and update selectedTab based on index
  if (event.touches.length === 1) {
    const clickedTabIndex = Math.floor((event.nativeEvent.offsetX / event.target.offsetWidth) * items.length);
    setSelectedTab(clickedTabIndex);
  } else {
    // Check for swipe gesture (considering minimum distance)
    swipeDirection.current = null; // Reset swipe direction on touch start
    event.persist(); // Persist event object for later reference in handleTouchMove
    const onTouchMove = (moveEvent) => {
      const swipeEndX = moveEvent.touches[0].clientX;
      const deltaX = swipeEndX - swipeStartX.current;

      if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
        swipeDirection.current = deltaX > 0 ? 'left' : 'right';
        setSelectedTab((prev) => Math.max(prev - 1, 0));
        document.removeEventListener('touchmove', onTouchMove); // Remove temporary listener
      }
    };
    document.addEventListener('touchmove', onTouchMove, { once: true }); // Add temporary listener
  }
};

// const removeActiveStyles = (currentIndex) => {
//   const buttons = document.querySelectorAll('.bg-blue-400 button');
//   buttons.forEach((button, index) => {
//     if (index !== currentIndex) {
//       button.classList.remove('ring-2', 'bg-white', 'text-blue-600');
//     }
//   });
// };

  const handleTouchMove = (event) => {
    const swipeEndX = event.touches[0].clientX;
    const deltaX = swipeEndX - swipeStartX.current;

    if (Math.abs(deltaX) > 50) {
      swipeDirection.current = deltaX > 0 ? 'left' : 'right'; // Update swipe direction
      if (swipeDirection.current === 'left') {
        setSelectedTab((prev) => Math.max(prev - 1, 0));
      } else if (swipeDirection.current === 'right') {
        setSelectedTab((prev) => Math.min(prev + 1, items.length - 1));
      }
    }

    // if (Math.abs(deltaX) > 50) {
    //   swipeDirection.current = deltaX > 0 ? 'left' : 'right';
    //   const newSelectedTab = Math.max(prev + (swipeDirection.current === 'left' ? -1 : 1), 0);
    //   removeActiveStyles(prev); // Remove active styles from previous tab
    //   setSelectedTab(newSelectedTab);
    // }

  };

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('touchstart', handleTouchStart);
      contentElement.addEventListener('touchmove', handleTouchMove);

      return () => {
        contentElement.removeEventListener('touchstart', handleTouchStart);
        contentElement.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [contentRef]);

  return (
    <>
      <div className="bg-sky-100 flex justify-center items-center py-12">
        <div className="max-w-md flex flex-col gap-y-2 w-full">
          <div className="bg-blue-400 p-1 rounded-xl flex justify-between items-center gap-x-2 font-bold text-white">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedTab(index)}
                className={`outline-none w-full p-2 hover:bg-blue-300 rounded-xl text-center focus:ring-2 focus:bg-white focus:text-blue-60 transition duration-300 ease-in-out ${
                    selectedTab === index ? 'ring-2 bg-white text-blue-600' : ''
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
  
            <div className="" ref={contentRef}>
              {items.map((item, index) => (
                <div className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
                 <p>{item.hcontent}</p>
                 <p>{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };
  
  export default Slide;
