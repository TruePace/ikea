import Image from "next/image";

const ContentFeed = () => {
    return (
        <>
          <p className="text-lg"> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores, nulla. 
        Repellendus, quas. Possimus nesciunt error dolor, 
        laudantium repellat ab fugiat nemo voluptatibus enim perspiciatis 
        deserunt ea impedit sed aperiam veniam.
        </p>
<div className=" relative   border-red-400 h-52 ">{/*border-2  removed*/}
        <Image src='/sponge.jpg' fill alt="Picture of the author"/>
        </div>
        </>
    );
}

export default ContentFeed;