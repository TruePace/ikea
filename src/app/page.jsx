
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
// import Tablet from "@/components/Headline_news_comps/Tabs/Tabs";
import Header from "@/components/Headline_news_comps/header/HeadlineHeader";


const page =  () => {
  
  
  
  return (
    <>
  <Header/>
   <div class="h-screen overflow-scroll  snap-y snap-mandatory ">
  <div class=" bg-blue-500 h-full snap-start inline-block w-full">
  
  
  <Slide/>
  </div>
  <div class=" bg-green-500 h-full snap-start inline-block w-full">
  <Slide/>
  </div>
  <div class=" bg-red-500 h-full snap-start inline-block w-full">
  <Slide/>
  </div>
  
  
</div>


  </>
  );
}


export default page;