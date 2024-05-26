import Link from "next/link";

import { FaRegComment } from "react-icons/fa";
import { BiLike,BiDislike  } from "react-icons/bi";
import { IoIosShareAlt } from "react-icons/io";
import { RiScreenshot2Line } from "react-icons/ri";

const EngagementFeed = () => {
    return (
        <>
            <div className= " border-red-400 w-full flex  mt-2 justify-between">
                <Link href='' className=" border-gray-600 h-12">< BiLike size='1.6em' color="gray"/> <p className="text-xs  border-red-300 w-">198k</p></Link>
                <Link href='' className=" border-gray-600 h-12"><BiDislike size='1.6em' color="gray" /><p className="text-xs  border-red-300">Dislike</p></Link>
                <Link href='' className=" border-gray-600 h-12"><FaRegComment size='1.6em' color="gray"/><p className="text-xs  border-red-300 ">545</p></Link>
                <Link href='' className=" border-gray-600 "><IoIosShareAlt size='1.9em' color="gray"/><p className="text-xs  border-red-300 ">Share </p></Link>
                <Link href='' className=" border-gray-600  "><RiScreenshot2Line size='1.9em' color="gray"/><p className="text-xs  border-red-300 ">ScreenShot</p></Link>
                </div>   
        </>
    );
}

export default EngagementFeed;