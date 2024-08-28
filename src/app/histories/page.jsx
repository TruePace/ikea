'use client'
import HistoryContent from "@/components/history_comps/HistoryContent";
import HistoryHeader from "@/components/history_comps/HistoryHeader";
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
            <HistoryContent/>
            <HistoryContent/>
            <HistoryContent/>
         
            </ProtectedRoute> 
        </>
    );
}

export default page;