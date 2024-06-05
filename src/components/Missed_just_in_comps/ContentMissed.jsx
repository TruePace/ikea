import Image from "next/image";

const ContentMissed = () => {
    return (
        <>
        <div className="  border-yellow-200 flex justify-between">{/*border-2  removed*/}
          <p className="text-sm font-sans  mt-2 font-extrabold capitalize w-7/12"> 
         How to learn Ai on your own a self study guide </p>
<div className=" relative w-3/12 border-red-400 h-20 mt-3 ">{/*border-2  removed*/}
        <Image src='/personal.jpg' fill alt="Picture of the author " className="rounded-md object-cover"/>
        </div>

        </div>

        
        </>
    );
   
}

export default ContentMissed;