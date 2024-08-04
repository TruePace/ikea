import { CiSearch } from "react-icons/ci";
import Link from "next/link";
const SubscribeFeed = ({channels}) => {
    return (
        <>
        {channels.map(channel=>(
            <div className= " border-2 border-gray-200 w-full flex items-center justify-between">{/*border-2  removed*/}
           
           <div className="avatar">
  <div className="w-11 rounded-full">
    <img src="/sponge.jpg" />
  </div>
</div>

<p className="font-semibold text-sm whitespace-nowrap" key={channel.id}>{channel.name}</p>

<button className="btn btn-sm font-bold bg-neutral-content">Subscribe</button>
<div><Link href='' className=" border-gray-600 h-12 "> <CiSearch size='1.6em' /></Link></div>
    
            </div>
))}
        </>
    );
}

export default SubscribeFeed;