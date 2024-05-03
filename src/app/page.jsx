import Tablet from "@/components/Headline_news_comps/Tabs/Tabs";
import Header from "@/components/Headline_news_comps/header/HeadlineHeader";


const page =  () => {
  
  
  
  return (
    <>
  
 


  <Header/>
   <div class="h-screen overflow-scroll  snap-y snap-mandatory ">
  <div class=" bg-blue-500 h-full snap-start inline-block w-full">
  
  <Tablet/>
  </div>
  <div class=" bg-green-500 h-full snap-start inline-block w-full">Item 2</div>
  <div class=" bg-red-500 h-full snap-start inline-block w-full">Item 3</div>
  <div class=" bg-yellow-300 h-full snap-start inline-block w-full">Item 4</div>
  <div class=" bg-purple-500 h-full snap-start inline-block w-full">Item 5</div>
 
  <div class=" bg-black h-full snap-start inline-block w-full">Item 2</div>
  <div class=" bg-zinc-700 h-full snap-start inline-block w-full">Item 3</div>
  <div class=" bg-blue-400 h-full snap-start inline-block w-full">Item 4</div>
  <div class=" bg-cyan-900 h-full snap-start inline-block w-full">Item 5</div>
  
</div>


  </>
  );
}


export default page;