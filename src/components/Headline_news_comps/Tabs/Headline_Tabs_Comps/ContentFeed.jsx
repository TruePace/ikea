import Image from "next/image";

const ContentFeed = () => {
    return (
        <>
          <p className="text-md text-gray-600 mt-2 "> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores, nulla. 
        Repellendus, quas. Possimus nesciunt error dolor, 
        laudantium repellat ab fugiat nemo voluptatibus enim perspiciatis 
        deserunt ea impedit sed aperiam veniam.

       
        </p>
<div className=" relative  border-red-400 h-64 mt-2 ">{/*border-2  removed*/}
        <Image src='/personal.jpg' fill alt="Picture of the author " className="rounded-md object-cover"/>
        </div>
        </>
    );
}

export default ContentFeed;