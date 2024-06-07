import Image from "next/image";
import { LuDot } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
const HistoryContent = () => {
    return (
        <>
             <div className="w-11/12  border-gray-200 py-2 m-auto  flex  gap-2">
                {/* image section*/}
             <div className=" relative w-6/12 border-red-400 h-26 ">{/*border-2  removed*/}
        <Image src='/personal.jpg' fill alt="Picture of the author " className="rounded-md object-cover"/>
        </div>
{/* contents section */}
<div className="font-sans  border-red-400 w-6/12">
    <p className="text-sm   font-extrabold capitalize"> 
    How to learn Ai on your own a self study guide</p>
    <div class="  text-sm mt-2 text-gray-400">
        <p class='flex gap-1'>< LuDot size='1.2em'/>Clever Programmer </p> 
        <p class='flex gap-1'><IoEyeOutline size='1.4em'/> 20k </p>
    </div>
    
    
    
    </div>
    </div> 
        </>
    );
}

export default HistoryContent;