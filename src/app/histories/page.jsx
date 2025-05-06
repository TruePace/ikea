'use client'

import HistoryHeader from "@/components/history_comps/HistoryHeader";
import HistoryContent from "@/components/history_comps/HistoryContent";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import SEO from "@/components/SEO/Seo";



//  export const metadata = {
//     title: "TruePace History title",
//     description: "History description",
// }

const Page = () => {
    return (
        <>
<ProtectedRoute>
     <SEO 
                title="News History | TruePace"
                description="Browse your news reading history and revisit important stories with TruePace's History feature."
                canonical="/histories"
                tags={["news history", "reading history", "past stories"]}
            />
        <HistoryHeader/>
            <HistoryContent/>
            
          
         
            </ProtectedRoute> 
        </>
    );
}

export default Page;