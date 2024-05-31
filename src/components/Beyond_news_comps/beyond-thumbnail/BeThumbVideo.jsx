import Image from "next/image";

import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { LuDot } from "react-icons/lu";


const BeThumbVideo = () => {
    return (
        <>
 

        <div class="w-full    py-3">{/* bg-yellow-300 was used*/}
<div class=' border-black relative h-56 '>{/* border-2 was used */}
<Image src='/rubber.jpg'  fill alt="Picture of the author"  />
</div>

<div class='border border-gray-300-100 pt-2 pr-8 pl-2.5 pb-1 flex justify-between'>{/*avatar and text div and border-2 was used */ }
{/*avatar container */}
<div className="avatar">
  <div className="w-full h-10 rounded-full">
    <img src="sponge.jpg" />
  </div>
</div>
<div class='w-4/5 font-sans  '>{/*text div con  'bg-slate-400' was there*/}
    <p class='font-semibold text-lg '>A day in the life of an amazon engineer</p>
    <div class=" flex justify-between text-sm mt-2 text-gray-400"><p class='flex'>< LuDot size='1.2em'/>Clever Programmer </p> <p class='flex'>< LuDot size='1.2em'/>12 hrs ago</p> </div>
    <div class=" flex justify-between text-sm mt-2 text-gray-400"><p class='flex gap-0.5'> <FaRegComment size="1.2em"/>1k </p> <p class='flex gap-0.5'> <BiLike size="1.2em"/> 2k</p> <p class='flex gap-0.5'><IoEyeOutline size='1.4em'/> 20k </p> 
    </div>{/* end of text div con */}
    </div>{/* end of beside avatar container  */ }
</div>{/* end of avatar and text div */ }


</div> {/*end  of div for py-3 or w-full  */}

        </>
    );
}

export default BeThumbVideo;