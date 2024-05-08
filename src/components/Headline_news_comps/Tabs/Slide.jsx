'use client';
// import { useState, useEffect, useRef } from 'react';




// let items = [
//     { title: 'Headline News 1', label: 'Headline News',content:(
//       <>
//         <h1 className='text-3xl text-blue-600'>hello Dear</h1>
//         <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis
//            quo ratione explicabo quidem porro commodi voluptatum dicta enim iste? Illum dolore dolorum et eligendi 
//            laboriosam alias officia, tenetur quod itaque.</p>
       
//       </>
//     ) },
//     { title: 'Headline News 2', label: 'Headline News',content:(
//         <>
//           <h1 className='text-3xl text-blue-600'>Tab 2</h1>
//           <p> We  are the convenant keeping God he never leaves us he said he wont forsake us 
//             he would walk beside us and that is all that matters
//           </p>
         
//         </>
//       ) }

// ]

// const Slide = () => {
//     const [selectedTab, setSelectedTab] = useState(0);
//   const firstBtnRef = useRef();

//   useEffect(() => {
//     firstBtnRef.current.focus();
//   }, []);
//     return (
//         <>
//            <div className='bg-sky-100 flex justify-center items-center py-12'>
//       <div className='max-w-md flex flex-col gap-y-2 w-full'>
//         <div className='bg-blue-400 p-1  rounded-xl flex justify-between items-center gap-x-2 font-bold text-white'>
//           {items.map((item, index) => (
//             <button
//               ref={index === 0 ? firstBtnRef : null}
//               key={index}
//               onClick={() => setSelectedTab(index)}
//               className={`outline-none w-full p-2 hover:bg-blue-300 rounded-xl text-cneter focus:ring-2 focus:bg-white focus:text-blue-600 ${
//                 selectedTab === index ? 'ring-2 bg-white text-blue-600' : ''
//               } `}
//             >
//               {item.title}
//             </button>
//           ))}
//         </div>

//         <div className='bg-white p-2 rounded-xl'>
//           {items.map((item, index) => (
//             <div className={`${selectedTab === index ? '' : 'hidden'}`}>
//               {item.content}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div> 
//         </>
//     );
// }

// export default Slide;
// import { useState, useEffect, useRef } from 'react';

// let items = [
//   { title: 'Headline News 1', label: 'Headline News', content: (<><h1>hello Dear</h1><p>Lorem ipsum...</p></>) },
//   { title: 'Headline News 2', label: 'Headline News', content: (<><h1>Tab 2</h1><p>We are the covenant...</p></>) }
// ];

// const Slide = () => {
//   const [selectedTab, setSelectedTab] = useState(0);
//   const contentRef = useRef(null); // Ref for the content container
//   const swipeStartX = useRef(null); // Store starting swipe position

//   const handleTouchStart = (event) => {
//     swipeStartX.current = event.touches[0].clientX; // Get initial X position
//   };

//   const handleTouchMove = (event) => {
//     const swipeEndX = event.touches[0].clientX;
//     const deltaX = swipeEndX - swipeStartX.current; // Calculate swipe distance

//     if (Math.abs(deltaX) > 50) { // Minimum swipe distance threshold
//       if (deltaX > 0) { // Swiped left (previous tab)
//         setSelectedTab((prev) => Math.max(prev - 1, 0)); // Handle edge case
//       } else { // Swiped right (next tab)
//         setSelectedTab((prev) => Math.min(prev + 1, items.length - 1)); // Handle edge case
//       }
//     }
//   };

//   useEffect(() => {
//     const contentElement = contentRef.current;
//     if (contentElement) {
//       contentElement.addEventListener('touchstart', handleTouchStart);
//       contentElement.addEventListener('touchmove', handleTouchMove);

//       return () => { // Cleanup on unmount
//         contentElement.removeEventListener('touchstart', handleTouchStart);
//         contentElement.removeEventListener('touchmove', handleTouchMove);
//       };
//     }
//   }, [contentRef]);

//   return (
//     <>
//       <div className="bg-sky-100 flex justify-center items-center py-12">
//         <div className="max-w-md flex flex-col gap-y-2 w-full">
//           <div className="bg-blue-400 p-1 rounded-xl flex justify-between items-center gap-x-2 font-bold text-white">
//             {items.map((item, index) => (
//               <button
//                 key={index}
//                 onClick={() => setSelectedTab(index)}
//                 className={`outline-none w-full p-2 hover:bg-blue-300 rounded-xl text-center focus:ring-2 focus:bg-white focus:text-blue-600 ${
//                   selectedTab === index ? 'ring-2 bg-white text-blue-600' : ''
//                 }`}
//               >
//                 {item.title}
//               </button>
//             ))}
//           </div>

//           <div className="bg-white p-2 rounded-xl" ref={contentRef}>
//             {items.map((item, index) => (
//               <div className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
//                 {item.content}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Slide;

// import { useState, useEffect, useRef } from 'react';
// import { animated, useSpring } from '@react-spring/web'; // Animation library

import { useState, useEffect, useRef } from 'react';

let items = [
  { title: 'Headline News 1', label: 'Headline News', content: (<><h1>hello Dear</h1><p>Lorem ipsum...</p></>) },
  { title: 'Headline News 2', label: 'Headline News', content: (<><h1>Tab 2</h1><p>We are the covenant...</p></>) }
];

const Slide = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const contentRef = useRef(null);
  const swipeStartX = useRef(null);
  const swipeDirection = useRef(null); // Track swipe direction (left/right)

  const handleTouchStart = (event) => {
    swipeStartX.current = event.touches[0].clientX;
    // Check for single touch (click) and update selectedTab based on index
    if (event.touches.length === 1) {
      const clickedTabIndex = Math.floor((event.nativeEvent.offsetX / event.target.offsetWidth) * items.length);
      setSelectedTab(clickedTabIndex);
    }
  };

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
                className={`outline-none w-full p-2 hover:bg-blue-300 rounded-xl text-center focus:ring-2 focus:bg-white focus:text-blue-60 ${
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
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };
  
  export default Slide;
