import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import BeThumbArticle from "@/components/Beyond_news_comps/beyond-thumbnail/BeThumbArticle";
import BeThumbVideo from "@/components/Beyond_news_comps/beyond-thumbnail/BeThumbVideo";
import SecondSocketHandler from "@/components/Socket io/SecondSocketHandler";
import SocketHandler from "@/components/Socket io/SocketHandler";


// import Slide from "@/components/Headline_news_comps/Tabs/Slide";
export const metadata = {
    title: "Beyond Headline  title",
    description: "Beyond Headline description",
}

const page = () => {
    return (
        <>
        <Header/>
   <SocketHandler/>
   <SecondSocketHandler/>
    
        <BeThumbVideo/>
        <BeThumbArticle/>
        </>
    );
}

export default page;