import Image from "next/image";

const ContentMissed = ({message, picture}) => {
  return (
    <div className="flex justify-between">
      <p className="text-sm font-sans mt-2 font-extrabold w-7/12">{message}</p>
      {picture && (
        <div className="relative w-2/5 h-24 mt-3 bg-blue-300">
          <Image src={picture} fill alt="Content image" className="rounded-md object-cover"/>
        </div>
      )}
    </div>
  );
}

export default ContentMissed;