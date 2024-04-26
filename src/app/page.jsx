'use client'
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
 
const page =  () => {
  const data = [
    {
      label: "HTML",
      value: "html",
      desc: `It really matters and then like it really doesn't matter.
      What matters is the people who are sparked by it. And the people 
      who are like offended by it, it doesn't matter.`,
    },
    {
      label: "React",
      value: "react",
      desc: `Because it's about motivating the doers. Because I'm here
      to follow my dreams and inspire other people to follow their dreams, too.`,
    },
    {
      label: "Vue",
      value: "vue",
      desc: `We're not always in the position that we want to be at.
      We're constantly growing. We're constantly making mistakes. We're
      constantly trying to express ourselves and actualize our dreams.`,
    },
    {
      label: "Angular",
      value: "angular",
      desc: `Because it's about motivating the doers. Because I'm here
      to follow my dreams and inspire other people to follow their dreams, too.`,
    },
    {
      label: "Svelte",
      value: "svelte",
      desc: `We're not always in the position that we want to be at.
      We're constantly growing. We're constantly making mistakes. We're
      constantly trying to express ourselves and actualize our dreams.`,
    },
  ];
 
  
  
  return (
    <>
  
 



   <div class="h-screen overflow-scroll    snap-y snap-mandatory ">
  <div class=" bg-blue-500 h-full snap-start inline-block w-full">
  <Tabs value="html">
      <TabsHeader>
        {data.map(({ label, value }) => (
          <Tab key={value} value={value}>
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {data.map(({ value, desc }) => (
          <TabPanel key={value} value={value}>
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
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