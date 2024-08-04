import HistoryContent from "@/components/history_comps/HistoryContent";
import HistoryHeader from "@/components/history_comps/HistoryHeader";


export const metadata = {
    title: "TruePace History title",
    description: "History description",
}

const page = () => {
    return (
        <>
        <HistoryHeader/>
            <HistoryContent/>
            <HistoryContent/>
            <HistoryContent/>
            <HistoryContent/>
            
        </>
    );
}

export default page;