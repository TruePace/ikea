'use client'

import Header from "@/components/Beyond_news_comps/beyond-header/Header";
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


       <Header/>
       <MissedJustInContainer/>
        
       </ProtectedRoute>
        </>
    );
}

export default page;