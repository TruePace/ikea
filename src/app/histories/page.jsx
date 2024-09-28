'use client'
import HistoryArticleContent from "@/components/history_comps/HistoryArticleContent";
import HistoryHeader from "@/components/history_comps/HistoryHeader";
import HistoryContent from "@/components/history_comps/HistoryContent";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";



//  export const metadata = {
//     title: "TruePace History title",
//     description: "History description",
// }

const page = () => {
    return (
        <>
<ProtectedRoute>
        <HistoryHeader/>
            <HistoryContent/>
            
          
         
            </ProtectedRoute> 
        </>
    );
}

export default page;