import HeadlineHeader from "@/components/Headline_news_comps/header/HeadlineHeader";
import MissedJustInContainer from "@/components/Missed_just_in_comps/MissedJustInContainer";
export const metadata = {
    title: "TruePace Missed Just In title",
    description: "Missed Just In description",
}

const page = () => {
    return (
        <>
        <HeadlineHeader/>
       <MissedJustInContainer/>
      
        </>
    );
}

export default page;