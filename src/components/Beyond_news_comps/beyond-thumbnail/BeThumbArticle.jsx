import Image from "next/image";
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";

const BeThumbArticle = () => {
    return (
        <>
             <div class="w-full px-3 mb-20">{/* bg-red-300 was used*/}
             {/* about creator  */}
             <div className= " border-gray-200 gap-3 flex items-center ">{/*border-2  removed*/}
            <div className="avatar">
  <div className="w-11 rounded-full">
    <img src="/sponge.jpg" />
  </div>
</div>
<p className="font-semibold text-sm whitespace-nowrap">@Sport Essential</p>
</div>

{/* engagement content */}
<p className="text-md text-gray-600 mt-2  "> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores, nulla. 
        Repellendus, quas. Possimus nesciunt error dolor, 
        laudantium repellat ab fugiat nemo voluptatibus enim perspiciatis 
        deserunt ea impedit sed aperiam veniam.

       
        </p>
<div className=" relative   border-red-400 h-64 mt-2 ">{/*border-2  removed*/}
        <Image src='/sponge.jpg' fill alt="Picture of the author " className="rounded-md"/>
        </div>

        <div class=" flex justify-between text-sm mt-2 text-gray-400"><p class='flex gap-0.5'>
             <FaRegComment size="1.2em"/>1k </p> <p class='flex gap-0.5'> <BiLike size="1.2em"/> 2k</p> <p class='flex gap-0.5'><IoEyeOutline size='1.4em'/> 20k </p> 
             </div>

             </div> {/*end of div bg-yellow-300 was used*/}
        </>
    );
}

export default BeThumbArticle;