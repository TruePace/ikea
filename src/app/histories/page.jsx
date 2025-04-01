'use client'

import HistoryHeader from "@/components/history_comps/HistoryHeader";
import HistoryContent from "@/components/history_comps/HistoryContent";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";



//  export const metadata = {
//     title: "TruePace History title",
//     description: "History description",
// }

const Page = () => {
    return (
        <>
<ProtectedRoute>
        <HistoryHeader/>
            <HistoryContent/>
            
          
         
            </ProtectedRoute> 
        </>
    );
}

export default Page;