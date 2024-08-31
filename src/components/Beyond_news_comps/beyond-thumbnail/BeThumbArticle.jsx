 'use client'
 import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { useAuth } from "@/app/(auth)/AuthContext";

const BeThumbArticle = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleClick = () => {
        if (!user) {
            router.push('/login');
        } else {
            // Navigate to the article page (replace with actual route)
            router.push('/article-page');
        }
    };

    return (
        <>
        <div onClick={handleClick} className="w-full  px-3 mb-20 cursor-pointer">{/*bg-red-300 */}
             {/* about creator  */}
             <div className= "  border-gray-200 gap-3 flex items-center ">{/*border-2  removed*/}
            <div className="avatar">
  <div className="w-11 rounded-full">
  <Image src='/sponge.jpg' alt="Avatar" width={40} height={40} className="rounded-full" />
  </div>
</div>
<p className="font-semibold text-sm ">@Sport Essential</p>
<p className="text-sm text-gray-400 flex"> < LuDot size='1.2em'/> 10 mins ago</p>
</div>

{/* engagement content */}
<p className="text-md text-gray-600 mt-2  "> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores, nulla. 
        Repellendus, quas. Possimus nesciunt error dolor, 
        laudantium repellat ab fugiat nemo voluptatibus enim perspiciatis 
        deserunt ea impedit sed aperiam veniam.

       
        </p>
<div className=" relative   border-red-400 h-64 mt-2 ">{/*border-2  removed*/}
        <Image src='/bruno.jpg' fill alt="Picture of the author " className="rounded-md object-cover"/>
        </div>

        <div class=" flex justify-between text-sm mt-2 text-gray-400"><p class='flex gap-0.5'>
             <FaRegComment size="1.2em"/>1k </p> <p class='flex gap-0.5'> <BiLike size="1.2em"/> 2k</p> <p class='flex gap-0.5'><IoEyeOutline size='1.4em'/> 20k </p> 
             </div>

             </div> {/*end of div bg-yellow-300 was used*/}
        </>
    );
}

export default BeThumbArticle;