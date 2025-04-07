import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import BeyondContent from "@/components/Beyond_news_comps/beyond-thumbnail/BeyondContent";
import SecondSocketHandler from "@/components/Socket io/SecondSocketHandler";
import SocketHandler from "@/components/Socket io/SocketHandler";


// import Slide from "@/components/Headline_news_comps/Tabs/Slide";
// export const metadata = {
//     title: "Beyond Headline  title",
//     description: "Beyond Headline description",
// }

const Page = () => {
    return (
        <div className="flex flex-col h-screen  pb-16">
            <Header />
            <div className="flex-grow overflow-y-auto pt-4">
                <SocketHandler />
                <SecondSocketHandler />
                <BeyondContent />
            </div>
        </div>
    );
}

export default Page;