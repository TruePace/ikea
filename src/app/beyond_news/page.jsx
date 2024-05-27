import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import BeThumbArticle from "@/components/Beyond_news_comps/beyond-thumbnail/BeThumbArticle";
import BeThumbVideo from "@/components/Beyond_news_comps/beyond-thumbnail/BeThumbVideo";
// import Slide from "@/components/Headline_news_comps/Tabs/Slide";

const page = () => {
    return (
        <>
        <Header/>
        <BeThumbVideo/>
        <BeThumbArticle/>
        </>
    );
}

export default page;