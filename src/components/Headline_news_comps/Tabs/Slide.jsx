'use client';
import { useState, useRef, useEffect } from 'react';
import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';
import { FaNewspaper, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Slide = ({ channel, headlineContent, justInContents }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const slideRef = useRef(null);
  const [currentJustInContent, setCurrentJustInContent] = useState([]);
  const [channelsMap, setChannelsMap] = useState({});
  const hasJustInContent = currentJustInContent.length > 0;

  useEffect(() => {
    // Sort justInContents, prioritizing current channel but without removing duplicates
    const sortedContent = justInContents.sort((a, b) => {
      if (a.channelId === channel._id && b.channelId !== channel._id) return -1;
      if (b.channelId === channel._id && a.channelId !== channel._id) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  
    // Update the state with the sorted content
    setCurrentJustInContent(sortedContent);
  
    // Fetch channels for all unique channelIds in justInContents
    const uniqueChannelIds = [...new Set(sortedContent.map(content => content.channelId))];
    Promise.all(uniqueChannelIds.map(fetchChannel))
      .then(channels => {
        const newChannelsMap = {};
        channels.forEach(ch => {
          if (ch) newChannelsMap[ch._id] = ch;
        });
        setChannelsMap(newChannelsMap);
      });
  }, [justInContents, channel._id]);
  

  // Function to fetch a single channel
  const fetchChannel = async (channelId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${channelId}`);
      if (!response.ok) throw new Error('Failed to fetch channel');
      return await response.json();
    } catch (error) {
      console.error('Error fetching channel:', error);
      return null;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSelectedTab(0);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (slideRef.current) {
      observer.observe(slideRef.current);
    }

    return () => {
      if (slideRef.current) {
        observer.unobserve(slideRef.current);
      }
    };
  }, []);

  const items = [
    {
      title: 'Headline News',
      renderContent: () => (
        <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
          <SubscribeFeed channel={channel} />
          <ContentFeed content={headlineContent}/>
          <EngagementFeed content={headlineContent}/>
        </div>
      )
    },
    {
      title: 'Just In',
      renderContent: () => {
        const hasJustInContent = currentJustInContent.length > 0;
        return (
          <div className='border-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll whitespace-nowrap snap-x snap-mandatory w-full'>
            {hasJustInContent ? (
              currentJustInContent.map((content) => (
                <div key={content._id} className='w-full inline-block align-top snap-start h-screen whitespace-normal'>
                  <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
                    <SubscribeFeed channel={channelsMap[content.channelId] || {}} />
                    <ContentFeed content={content}/>
                    <EngagementFeed content={content}/>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-screen  font-sans ">
               <div className="text-4xl mb-4 flex items-center">
    <FaNewspaper className="mr-2" />
    <FaArrowLeft className="mx-2" />
    <FaCalendarAlt className="ml-2" />
  </div>
                <p className="text-center text-md mb-4  capitalize ">
                  No breaking news right now. 
                  <br/>
                  Recent updates moved to  Headline News 
                </p>
                <p className="text-center text-md capitalize">
                 Visit <b> Missed Just In</b> to catch up
                </p>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div ref={slideRef} className='h-full flex justify-center'>
      <div className='max-w-md flex flex-col w-full'>
        <div className='bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white'>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`outline-none w-full p-1 rounded-lg text-center transition-colors duration-300 ${
                selectedTab === index ? 'bg-white text-neutral-800' : ''
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
        
        <div className=''>
          {items.map((item, index) => (
            <div key={index} className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
              {item.renderContent()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slide;



// Is there a way i can do it such that i can optionally upload only 'message' and 'channelId' without adding 'picture' based on what is available on the schema without making it compulsory for me to put picture there because if i dont add 'picture' there..It willl bring indication on the user interface 'alt' that picture will be there.I just want it to be optional for creators to either upload pictures if they like or not uploading..If they put pictures with their message ,it's fine.If they don't it's also fine ...Here is my code 'import { Content } from "../models/HeadlineModel.js"; const getJustInContent = async (req, res) => {   try {     const { currentChannelId } = req.query;     let justInContent = await Content.find({       isJustIn: true,       justInExpiresAt: { $gt: new Date() }     }).sort('-createdAt').limit(50);      // Move current channel's content to the front     if (currentChannelId) {       justInContent.sort((a, b) => {         if (a.channelId.toString() === currentChannelId) return -1;         if (b.channelId.toString() === currentChannelId) return 1;         return 0;       });     }      res.status(200).json(justInContent);   } catch (err) {     res.status(500).json({ message: 'Error fetching Just In content', error: err.message });   } };     const getHeadlineContent = async (req, res) => {   try {     // Fetch the existing headline content     const existingHeadlineContent = await Content.find({       isJustIn: false,     }).sort('-createdAt').limit(50);      // Fetch the content that has moved from the 'Just In' tab     const expiredJustInContent = await Content.find({       isJustIn: true,       justInExpiresAt: { $lte: new Date() },     }).sort('-createdAt');      // Create a new array that combines the existing headline content and the new content     const headlineContent = [       ...existingHeadlineContent,       ...expiredJustInContent.filter((content) => {         // Filter out the content that already exists in the 'Headline News' tab         return !existingHeadlineContent.some((existing) => existing.channelId === content.channelId);       }),     ];      res.status(200).json(headlineContent);   } catch (err) {     res.status(500).json({ message: 'Error fetching Headline content', error: err.message });   } };      const postNewContent = async (req, res) => {     try {       const newContent = new Content({         ...req.body,         isJustIn: true,         justInExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now       });       await newContent.save();       res.status(201).json(newContent);     } catch (err) {       res.status(500).json({ message: 'Error creating new content', error: err.message });     }   };   const getHeadlineNewsContentId = async (req, res) => {     try {       const content = await Content.findById(req.params.id);       if (!content) {         return res.status(404).json({ message: 'Content not found' });       }       res.status(200).json(content);     } catch (err) {       res.status(500).json({ message: 'Error fetching content', error: err.message });     }   };    const updateHeadlineContent = async (req, res) => {     try {       const contentId = req.params.id;       const updates = req.body;          const updatedContent = await Content.findByIdAndUpdate(contentId, updates, { new: true });          if (!updatedContent) {         return res.status(404).json({ message: 'Content not found' });       }          // Trigger the getHeadlineContent function to update the 'Headline News' tab       await getHeadlineContent(req, res);          res.status(200).json(updatedContent);     } catch (err) {       res.status(500).json({ message: 'Error updating content', error: err.message });     }   }; // Add a new function to update engagement score   const updateEngagementScore = async (contentId) => {     const content = await Content.findById(contentId);     if (content) {       content.engagementScore = content.calculateEngagementScore();       await content.save();     }   };      export { getJustInContent, getHeadlineContent, postNewContent ,updateEngagementScore,getHeadlineNewsContentId, updateHeadlineContent};' 'const ContentSchema = new mongoose.Schema({     message: { type: String },     picture: { type: String },     likeCount: { type: Number, default: 0 },     dislikeCount: { type: Number, default: 0 },     createdAt: { type: Date, default: Date.now },     isJustIn: { type: Boolean, default: true },     justInExpiresAt: { type: Date },     channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },     showInAllChannels: { type: Boolean, default: true },   engagementScore: { type: Number, default: 0 }   });' 'import express from 'express'; import { getJustInContent, getHeadlineContent, postNewContent,updateEngagementScore,getHeadlineNewsContentId,updateHeadlineContent } from '../Controllers/HeadlineNewsJustInController.js' const router = express.Router();  router.get('/just-in', getJustInContent); router.get('/headline', getHeadlineContent); router.post('/', postNewContent); // Route for getting content by ID router.get('/headline/:id', getHeadlineNewsContentId); router.put('/headline/:id', updateHeadlineContent)  // / Update engagement score router.put('/:contentId/engagement', async (req, res) => {   try {     await updateEngagementScore(req.params.contentId);     res.status(200).json({ message: 'Engagement score updated successfully' });   } catch (err) {     res.status(500).json({ message: 'Error updating engagement score', error: err.message });   } });  export default router;' ' cron.schedule('* * * * *', async () => {     try {       const expiredJustInContent = await Content.find({         isJustIn: true,         justInExpiresAt: { $lte: new Date() }       });          for (let content of expiredJustInContent) {         content.isJustIn = false;         content.showInAllChannels = false;         await content.save();       }          console.log(`Moved ${expiredJustInContent.length} items from Just In to Headline News`);     } catch (error) {       console.error('Error in cron job:', error);     }   });' ''use client' import {store, persistor} from "../Redux/store" import { Provider } from "react-redux"; import { PersistGate } from 'redux-persist/integration/react'; import Slide from "@/components/Headline_news_comps/Tabs/Slide"; import { fetchChannels, fetchContents, fetchJustInContents, fetchHeadlineContents } from "@/components/Utils/HeadlineNewsFetch"; import { useState, useEffect } from "react";  const Page = () => {   const [channels, setChannels] = useState([]);   const [headlineContents, setHeadlineContents] = useState([]);   const [justInContents, setJustInContents] = useState([]);   const [isLoading, setIsLoading] = useState(true);   const [error, setError] = useState(null);    useEffect(() => {     async function fetchData() {       try {         const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([           fetchChannels(),           fetchHeadlineContents(),           fetchJustInContents()         ]);         setChannels(channelsData);         setHeadlineContents(headlineContentsData);         setJustInContents(justInContentsData);       } catch (error) {         setError(error.message);       } finally {         setIsLoading(false);       }     }      fetchData();      const dataInterval = setInterval(fetchData, 30000);      return () => clearInterval(dataInterval);   }, []);    useEffect(() => {     const moveExpiredContent = () => {       const now = new Date();       const expiredContent = justInContents.filter(content => new Date(content.justInExpiresAt) <= now);              if (expiredContent.length > 0) {         setJustInContents(prev => prev.filter(content => new Date(content.justInExpiresAt) > now));         setHeadlineContents(prev => [...expiredContent, ...prev]);       }     };      const expirationInterval = setInterval(moveExpiredContent, 60000);      return () => clearInterval(expirationInterval);   }, [justInContents]);    if (isLoading) return <div>Loading...</div>;   if (error) return <div>Error: {error}</div>;    return (     <>       <Provider store={store}>         <PersistGate loading={null} persistor={persistor}>           <div className="h-screen overflow-scroll snap-y snap-mandatory">             {channels.map((channel) => (               <div key={channel._id} className="h-full snap-start inline-block w-full">                 <Slide                   channel={channel}                   headlineContent={headlineContents.find(content => content.channelId === channel._id) || {}}                   justInContents={justInContents}                 />               </div>             ))}           </div>         </PersistGate>       </Provider>     </>   ); }  export default Page;' 'import Image from "next/image";
// 'use client';
// import { useState, useRef, useEffect } from 'react';
// import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
// import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
// import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';
// import { FaNewspaper, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// const Slide = ({ channel, headlineContent, justInContents }) => {
//   const [selectedTab, setSelectedTab] = useState(0);
//   const slideRef = useRef(null);
//   const [currentJustInContent, setCurrentJustInContent] = useState([]);
//   const [channelsMap, setChannelsMap] = useState({});
//   const hasJustInContent = currentJustInContent.length > 0;

//   useEffect(() => {
//     // Filter and sort justInContents
//     const sortedContent = justInContents.sort((a, b) => {
//       if (a.channelId === channel._id && b.channelId !== channel._id) return -1;
//       if (b.channelId === channel._id && a.channelId !== channel._id) return 1;
//       return new Date(b.createdAt) - new Date(a.createdAt);
//     });
//     setCurrentJustInContent(sortedContent);

//     // Fetch channels for all unique channelIds in justInContents
//     const uniqueChannelIds = [...new Set(sortedContent.map(content => content.channelId))];
//     Promise.all(uniqueChannelIds.map(fetchChannel))
//       .then(channels => {
//         const newChannelsMap = {};
//         channels.forEach(ch => {
//           if (ch) newChannelsMap[ch._id] = ch;
//         });
//         setChannelsMap(newChannelsMap);
//       });
//   }, [justInContents, channel._id]);

//   // Function to fetch a single channel
//   const fetchChannel = async (channelId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${channelId}`);
//       if (!response.ok) throw new Error('Failed to fetch channel');
//       return await response.json();
//     } catch (error) {
//       console.error('Error fetching channel:', error);
//       return null;
//     }
//   };

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setSelectedTab(0);
//           }
//         });
//       },
//       { threshold: 0.5 }
//     );

//     if (slideRef.current) {
//       observer.observe(slideRef.current);
//     }

//     return () => {
//       if (slideRef.current) {
//         observer.unobserve(slideRef.current);
//       }
//     };
//   }, []);

//   const items = [
//     {
//       title: 'Headline News',
//       renderContent: () => (
//         <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
//           <SubscribeFeed channel={channel} />
//           <ContentFeed content={headlineContent}/>
//           <EngagementFeed content={headlineContent}/>
//         </div>
//       )
//     },
//     {
//       title: 'Just In',
//       renderContent: () => {
//         const hasJustInContent = currentJustInContent.length > 0;
//         return (
//           <div className='border-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll whitespace-nowrap snap-x snap-mandatory w-full'>
//             {hasJustInContent ? (
//               currentJustInContent.map((content) => (
//                 <div key={content._id} className='w-full inline-block align-top snap-start h-screen whitespace-normal'>
//                   <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
//                     <SubscribeFeed channel={channelsMap[content.channelId] || {}} />
//                     <ContentFeed content={content}/>
//                     <EngagementFeed content={content}/>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="flex flex-col items-center justify-center h-screen  font-sans ">
//                <div className="text-4xl mb-4 flex items-center">
//     <FaNewspaper className="mr-2" />
//     <FaArrowLeft className="mx-2" />
//     <FaCalendarAlt className="ml-2" />
//   </div>
//                 <p className="text-center text-md mb-4  capitalize ">
//                   No breaking news right now. 
//                   <br/>
//                   Recent updates moved to  Headline News 
//                 </p>
//                 <p className="text-center text-md capitalize">
//                  Visit <b> Missed Just In</b> to catch up
//                 </p>
//               </div>
//             )}
//           </div>
//         );
//       }
//     }
//   ];

//   return (
//     <div ref={slideRef} className='h-full flex justify-center'>
//       <div className='max-w-md flex flex-col w-full'>
//         <div className='bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white'>
//           {items.map((item, index) => (
//             <button
//               key={index}
//               onClick={() => setSelectedTab(index)}
//               className={`outline-none w-full p-1 rounded-lg text-center transition-colors duration-300 ${
//                 selectedTab === index ? 'bg-white text-neutral-800' : ''
//               }`}
//             >
//               {item.title}
//             </button>
//           ))}
//         </div>
        
//         <div className=''>
//           {items.map((item, index) => (
//             <div className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
//               {item.renderContent()}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Slide;


// const ContentFeed = ({content}) => {
//     return (
//         <>
//         <div key={content._id}>
//           <p className="text-md text-gray-600 mt-2 ">{content.message}</p>
// <div className=" relative  border-red-400 h-64 mt-2 ">{/*border-2  removed*/}
//         <Image src={content.picture} fill alt="Picture of the author " className="rounded-md object-cover"/>
//         </div>


//         </div>
//         </>
//     );
// }

// export default ContentFeed;'