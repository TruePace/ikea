import Image from "next/image";

const SubscribeMissed = () => {
    return (
        <>
       
       <div className= " border-gray-200 w-full  flex items-center gap-4 ">{/*border-2  removed*/}
<div className="avatar">
<div className="w-9 h-9 relative rounded-full overflow-hidden">
  <Image src="/sponge.jpg" alt="Sponge" fill className="object-cover"/>
</div>
</div>

<p className="font-semibold text-sm  capitalize text-gray-600">Thomas Tuchel</p>

<button className="btn btn-sm font-bold bg-neutral-content">Subscribe</button>

</div>


      
        </>
    );
}

export default SubscribeMissed;

