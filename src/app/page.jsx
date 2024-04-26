



const page =  () => {
  
  
  return (
    <>
    <div role="tablist" className="tabs tabs-bordered">
  <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Tab 1" />
  <div role="tabpanel" className="tab-content p-10">Tab content 1</div>

  <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Tab 2" checked />
  <div role="tabpanel" className="tab-content p-10">Tab content 2</div>

  <input type="radio" name="my_tabs_1" role="tab" className="tab tab-" aria-label="Tab 3" />
  <div role="tabpanel" className="tab-content p-10 ">Tab content 3</div>
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