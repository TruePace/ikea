
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
// import Tablet from "@/components/Headline_news_comps/Tabs/Tabs";
import Header from "@/components/Headline_news_comps/header/HeadlineHeader";


const page =  () => {
  
  
  
  return (
    <>
  <Header/>
   <div class="h-screen overflow-scroll  snap-y snap-mandatory ">
    
  <div class=" h-full snap-start inline-block w-full">{/*bg-blue-500 */}
  <Slide/>
  </div>
  <div class="  h-full snap-start inline-block w-full">{/*bg-green-500 */}
  <Slide/>
  </div>
  <div class="  h-full snap-start inline-block w-full">{/*bg-red-500 */}
  <Slide/>
  </div>
  
  
</div>


  </>
  );
}


export default page;