// "use client"
// import { useEffect,useState ,useRef } from "react";

// const Tabs = () => {
//     const firstBtnRef =useRef();
//     const [selectedTab,useSelectedTab] =useState(0)

//   useEffect(()=>{
//     firstBtnRef.current.focus()
//   },[])  
//     return (
//         <>
//           <div className="bg-yellow-200 h-full rounded-lg py-3 ">
//             <h1>Tabs Page</h1>
         
// {/*Tabs component below  */}
// <div className="bg-sky-100 h-full flex justify-center items-center py-3">
// <div className="max-w-md flex flex-col gap-y-1 w-full">
    
// <div className="bg-slate-500 p-1 rounded-xl flex  justify-between items-center gap-x-2 font-bold text-white">
//     {items.map((item,index)=>(
//         <button 
//         ref={index === 0 ? firstBtnRef: null}
//         key={index}
//         onClick={()=> useSelectedTab(index)}
//         className="outline-none w-full p-2 hover:bg-blue-300 rounded-xl text-center focus:ring-2 focus:bg-white focus:text-blue-600">
//             {item.title}
//             </button>
//     ))}
// </div>



// <div>{items.map((item,index)=>(
//     <div className={`${selectedTab === index ? '' :'hidden'}`}>
//         {item.content}</div>
// ))}

// </div>

// </div> 
// </div>
//             </div>    
//         </>
//     );
// }

// export default Tabs;
// const items=[
//     {
// title:'Tab 1',
// content:(
//     <>
//     <h1>Title test 1</h1>
//     <p>
//         Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quam illo odit 
//  error sapiente ratione minima! Delectus sed repellendus atque reprehenderit qui
//       laudantium. Fugiat dicta eum ex quis, ab eius voluptates.
//       </p>
//       </>
// )
//     },
//     {
//         title:'Tab 2',
//         content:(
//             <>
//             <h1>Title test 2</h1>
//             <p>
//                 who is kike the lord in al the earth ...matchless love and beauty endless worth
//               </p>
//               </>
//         )
//             },
//             {
//                 title:'Tab 3',
//                 content:(
//                     <>
//                     <h1>Title test 3</h1>
//                     <p>
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quam illo odit 
//                  error sapiente ratione minima! Delectus sed repellendus atque reprehenderit qui
//                       laudantium. Fugiat dicta eum ex quis, ab eius voluptates.
//                       </p>
//                       </>
//                 )
//                     },
// ]

'use client'

import {Collection, Tab, TabList, TabPanel, Tabs} from 'react-aria-components';
import {animate, motion, useMotionValueEvent, useScroll, useTransform} from 'framer-motion';
import {useCallback, useEffect, useRef, useState} from 'react';

let tabs = [
  { id: 'world', label: 'World' },
  { id: 'ny', label: 'N.Y.' },
  { id: 'business', label: 'Business' },
  { id: 'arts', label: 'Arts' },
  { id: 'science', label: 'Science' }
];

const Tablet = () => {
    let [selectedKey, setSelectedKey] = useState(tabs[0].id);

  let tabListRef = useRef(null);
  let tabPanelsRef = useRef(null);

  // Track the scroll position of the tab panel container.
  let { scrollXProgress } = useScroll({
    container: tabPanelsRef
  });

  // Find all the tab elements so we can use their dimensions.
  let [tabElements, setTabElements] = useState([]);
  useEffect(() => {
    if (tabElements.length === 0) {
      let tabs = tabListRef.current.querySelectorAll('[role=tab]');
      setTabElements(tabs);
    }
  }, [tabElements]);

  // This function determines which tab should be selected
  // based on the scroll position.
  let getIndex = useCallback(
    (x) => Math.max(0, Math.floor((tabElements.length - 1) * x)),
    [tabElements]
  );

  // This function transforms the scroll position into the X position
  // or width of the selected tab indicator.
  let transform = (x, property) => {
    if (!tabElements.length) return 0;

    // Find the tab index for the scroll X position.
    let index = getIndex(x);

    // Get the difference between this tab and the next one.
    let difference = index < tabElements.length - 1
      ? tabElements[index + 1][property] - tabElements[index][property]
      : tabElements[index].offsetWidth;

    // Get the percentage between tabs.
    // This is the difference between the integer index and fractional one.
    let percent = (tabElements.length - 1) * x - index;

    // Linearly interpolate to calculate the position of the selection indicator.
    let value = tabElements[index][property] + difference * percent;

    // iOS scrolls weird when translateX is 0 for some reason. 🤷‍♂️
    return value || 0.1;
  };

  let x = useTransform(scrollXProgress, (x) => transform(x, 'offsetLeft'));
  let width = useTransform(scrollXProgress, (x) => transform(x, 'offsetWidth'));

  // When the user scrolls, update the selected key
  // so that the correct tab panel becomes interactive.
  useMotionValueEvent(scrollXProgress, 'change', (x) => {
    if (animationRef.current || !tabElements.length) return;
    setSelectedKey(tabs[getIndex(x)].id);
  });

  // When the user clicks on a tab perform an animation of
  // the scroll position to the newly selected tab panel.
  let animationRef = useRef(null);
  let onSelectionChange = (selectedKey) => {
    setSelectedKey(selectedKey);

    // If the scroll position is already moving but we aren't animating
    // then the key changed as a result of a user scrolling. Ignore.
    if (scrollXProgress.getVelocity() && !animationRef.current) {
      return;
    }

    let tabPanel = tabPanelsRef.current;
    let index = tabs.findIndex((tab) => tab.id === selectedKey);
    animationRef.current?.stop();
    animationRef.current = animate(
      tabPanel.scrollLeft,
      tabPanel.scrollWidth * (index / tabs.length),
      {
        type: 'spring',
        bounce: 0.2,
        duration: 0.6,
        onUpdate: (v) => {
          tabPanel.scrollLeft = v;
        },
        onPlay: () => {
          // Disable scroll snap while the animation is going or weird things happen.
          tabPanel.style.scrollSnapType = 'none';
        },
        onComplete: () => {
          tabPanel.style.scrollSnapType = '';
          animationRef.current = null;
        }
      }
    );
  };

   
    return (
        <>
          <Tabs
      className="w-fit max-w-[min(100%,350px)]"
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
    >
      <div className="relative">
        <TabList ref={tabListRef} className="flex -mx-1" items={tabs}>
          {(tab) => (
            <Tab className="cursor-default px-3 py-1.5 text-md transition outline-none touch-none">
              {({ isSelected, isFocusVisible }) => (
                <>
                  {tab.label}
                  {isFocusVisible && isSelected && (
                    // Focus ring.
                    <motion.span
                      className="absolute inset-0 z-10 rounded-full ring-2 ring-black ring-offset-2"
                      style={{ x, width }}
                    />
                  )}
                </>
              )}
            </Tab>
          )}
        </TabList>
        {/* Selection indicator. */}
        <motion.span
          className="absolute inset-0 z-10 bg-white rounded-full mix-blend-difference"
          style={{ x, width }}
        />
      </div>
      <div
        ref={tabPanelsRef}
        className="my-4 overflow-auto snap-x snap-mandatory no-scrollbar flex"
      >
        <Collection items={tabs}>
          {(tab) => (
            <TabPanel
              shouldForceMount
              className="flex-shrink-0 w-full px-2 box-border snap-start outline-none -outline-offset-2 rounded focus-visible:outline-black"
            >
              <h2>{tab.label} contents...</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                sit amet nisl blandit, pellentesque eros eu, scelerisque eros.
                Sed cursus urna at nunc lacinia dapibus.
              </p>
            </TabPanel>
          )}
        </Collection>
      </div>
    </Tabs>
        </>
    );
}



export default Tablet;