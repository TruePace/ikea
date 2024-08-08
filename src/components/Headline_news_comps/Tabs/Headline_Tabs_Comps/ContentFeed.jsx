import Image from "next/image";

const ContentFeed = ({content}) => {
    return (
        <>
        <div key={content._id}>
          <p className="text-md text-gray-600 mt-2 ">{content.message}</p>
<div className=" relative  border-red-400 h-64 mt-2 ">{/*border-2  removed*/}
        <Image src={content.picture} fill alt="Picture of the author " className="rounded-md object-cover"/>
        </div>


        </div>
        </>
    );
}

export default ContentFeed;