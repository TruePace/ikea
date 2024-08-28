'use client'
import HeadlineHeader from "@/components/Headline_news_comps/header/HeadlineHeader";
import MissedJustInContainer from "@/components/Missed_just_in_comps/MissedJustInContainer";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
// export const metadata = {
//     title: "TruePace Missed Just In title",
//     description: "Missed Just In description",
// }

const page = () => {
    return (
        <>
        <ProtectedRoute>


        <HeadlineHeader/>
       <MissedJustInContainer/>
        
       </ProtectedRoute>
        </>
    );
}

export default page;