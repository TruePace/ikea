'use client';
import { useState, useEffect, useRef } from 'react';

const items =[
  {
    title:'Headline News',
  content:(
    <>
    <div className='border-2 border-blue-400 rounded-lg p-4'>
      <h1>Title Test 1</h1>
      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores, nulla. 
        Repellendus, quas. Possimus nesciunt error dolor, 
        laudantium repellat ab fugiat nemo voluptatibus enim perspiciatis 
        deserunt ea impedit sed aperiam veniam.
        </p>

    </div>
    </>
  )
  },
  {
    title:'Just In',
  content:(
    <>
    <div className='border-2  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll  whitespace-nowrap snap-x snap-mandatory w-full'>
      <div className='inline-block w-full  bg-green-400 h-screen  snap-start'>
     
         </div>
         <div  className='inline-block  w-full bg-red-400 h-screen snap-start'>
     
         </div>
         <div  className='inline-block  w-full bg-yellow-300 h-screen snap-start'>
     
         </div>
    </div>
    </>
  )
  }
  
]

const Slide = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const firstBtnRef = useRef();

  useEffect(() => {
    firstBtnRef.current.focus();
  }, []);

  return (
    <div className='bg-sky-100 h-full  flex justify-center py-12'>
      <div className='max-w-md flex flex-col gap-y-2 w-full'>
        <div className='bg-neutral-900 p-1   rounded-xl flex justify-between items-center gap-x-2 font-bold text-white'>
          {items.map((item, index) => (
            <button
              ref={index === 0 ? firstBtnRef : null}
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`outline-none w-full p-2 hover:bg-neutral-800 rounded-xl text-cneter focus:ring-2 focus:bg-white focus:text-neutral-800  ${
                selectedTab === index ? 'ring-2 bg-white text-neutral-800' : ''
              } `}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className=''>
          {items.map((item, index) => (
            <div className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slide;
