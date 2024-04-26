
'use client'

import { useState } from "react";
 
const page =  () => {
  const [activeTab, setActiveTab] = useState(1); // Initial active tab (index starts from 1)

  const handleTabChange = (event) => {
    setActiveTab(parseInt(event.target.value)); // Convert value to integer for indexing
  };
  
  return (
    <>
  
  <div role="tablist" className="tabs tabs-bordered">
      <input
        type="radio"
        id={`tab-${1}`} // Unique ID for each tab
        name="my_tabs"
        value={1} // Tab index
        role="tab"
        className="tab"
        aria-selected={activeTab === 1} // Set aria-selected for accessibility
        aria-controls={`tab-content-${1}`} // Link tab to content panel
        checked={activeTab === 1} // Set checked for active tab
        onChange={handleTabChange}
      />
      <label htmlFor={`tab-${1}`}>Tab 1</label> {/* Label associated with the radio button */}

      <input
        type="radio"
        id={`tab-${2}`}
        name="my_tabs"
        value={2}
        role="tab"
        className="tab"
        aria-selected={activeTab === 2}
        aria-controls={`tab-content-${2}`}
        checked={activeTab === 2}
        onChange={handleTabChange}
      />
      <label htmlFor={`tab-${2}`}>Tab 2</label>

      <input
        type="radio"
        id={`tab-${3}`}
        name="my_tabs"
        value={3}
        role="tab"
        className="tab"
        aria-selected={activeTab === 3}
        aria-controls={`tab-content-${3}`}
        checked={activeTab === 3}
        onChange={handleTabChange}
      />
      <label htmlFor={`tab-${3}`}>Tab 3</label>

      <div role="tabpanel" id={`tab-content-${1}`} className={`tab-content p-10 ${activeTab === 1 ? '' : 'hidden'}`}>
        Tab content 1
      </div>

      <div role="tabpanel" id={`tab-content-${2}`} className={`tab-content p-10 ${activeTab === 2 ? '' : 'hidden'}`}>
        Tab content 2
      </div>

      <div role="tabpanel" id={`tab-content-${3}`} className={`tab-content p-10 ${activeTab === 3 ? '' : 'hidden'}`}>
        Tab content 3
      </div>
    </div>




   <div class="h-screen overflow-scroll    snap-y snap-mandatory ">
  <div class=" bg-blue-500 h-full snap-start inline-block w-full">
  
  </div>
  <div class=" bg-green-500 h-full snap-start inline-block w-full">Item 2</div>
  <div class=" bg-red-500 h-full snap-start inline-block w-full">Item 3</div>
  <div class=" bg-yellow-300 h-full snap-start inline-block w-full">Item 4</div>
  <div class=" bg-purple-500 h-full snap-start inline-block w-full">Item 5</div>
 
  
  
</div>


  </>
  );
}


export default page;